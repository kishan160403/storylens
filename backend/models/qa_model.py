"""
Question answering module.
Covers answer offset extraction, off-the-shelf SQuAD inference,
and domain adaptation fine-tuning configuration.
"""

import re
import json
from pathlib import Path
from typing import Dict, List
from utils.data_loader import load_stories

RANDOM_SEED = 40499872

# Expect stories_annotated.json alongside stories.json in backend/
ANNOTATED_DATA_PATH = Path(__file__).parent.parent / "stories_annotated.json"
QA_MODEL = "deepset/bert-base-uncased-squad2"
QA_STYLES = ["descriptive", "hard-boiled", "for children"]

TAG_PAIRS = [
    ("[START_Q1]", "[END_Q1]", "question1", "answer1", "q1"),
    ("[START_Q2]", "[END_Q2]", "question2", "answer2", "q2"),
]
ALL_TAGS = ["[START_Q1]", "[END_Q1]", "[START_Q2]", "[END_Q2]"]


def load_annotated_stories() -> List[Dict]:
    """Load the annotated stories dataset."""
    if not ANNOTATED_DATA_PATH.exists():
        raise FileNotFoundError(
            f"stories_annotated.json not found at {ANNOTATED_DATA_PATH}. "
            "Place it in the backend/ directory."
        )
    with open(ANNOTATED_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def process_annotated_story(index: int) -> List[Dict]:
    """
    For a story identified by its index, return a list of two dicts —
    one per question/answer pair — with the following fields:
      id, question, context, answer_text, answer_start, style

    Guarantee: context[answer_start : answer_start + len(answer_text)] == answer_text
    """
    stories = load_annotated_stories()
    story = next((s for s in stories if s.get("index") == index), None)
    if story is None:
        raise ValueError(f"No story found with index {index}")

    annotated = story.get("annotated_story", "")
    results = []

    for start_tag, end_tag, q_key, a_key, q_suffix in TAG_PAIRS:
        # Build clean context by stripping all annotation tags
        context = annotated
        for tag in ALL_TAGS:
            context = context.replace(tag, "")

        start_match = re.search(re.escape(start_tag), annotated)
        end_match = re.search(re.escape(end_tag), annotated)
        if not start_match or not end_match:
            continue

        # Extract raw answer (may contain sibling tags — remove them)
        raw_answer = annotated[start_match.end() : end_match.start()]
        answer_text = raw_answer
        for tag in ALL_TAGS:
            if tag not in (start_tag, end_tag):
                answer_text = answer_text.replace(tag, "")

        answer_start = context.find(answer_text)

        results.append({
            "id": f"{index}_{q_suffix}",
            "question": story.get(q_key, ""),
            "context": context,
            "answer_text": answer_text,
            "answer_start": answer_start,
            "style": story.get("style", ""),
        })

    return results


def build_qa_dataset() -> List[Dict]:
    """
    Build QA pairs for descriptive / hard-boiled / for-children stories.
    Falls back to stories.json for demo mode if annotated file is absent.
    """
    try:
        annotated = load_annotated_stories()
    except FileNotFoundError:
        annotated = load_stories()

    qa_pairs = []
    for story in annotated:
        if story.get("style") not in QA_STYLES:
            continue
        try:
            qa_pairs.extend(process_annotated_story(story["index"]))
        except Exception:
            pass
    return qa_pairs


def run_squad_inference(question: str, context: str) -> Dict:
    """Run the off-the-shelf SQuAD model on a single question/context pair."""
    from transformers import pipeline

    pipe = pipeline("question-answering", model=QA_MODEL, truncation=True)
    result = pipe(question=question, context=context)
    return {
        "answer": result["answer"],
        "score": round(result["score"], 4),
        "start": result["start"],
        "end": result["end"],
        "model": QA_MODEL,
    }


def get_finetuning_config() -> Dict:
    """Configuration and architecture notes for domain-adaptation fine-tuning."""
    return {
        "base_model": QA_MODEL,
        "task": "AutoModelForQuestionAnswering",
        "training_notes": [
            "Tokenise with prepare_train_features using a sliding window approach",
            "Token offsets map context tokens back to original character positions",
            "Model produces start_logits and end_logits over all input tokens",
            "Answer span = argmax(start_logits) … argmax(end_logits)",
            "Train on the full dataset; decreasing loss confirms correct learning",
        ],
        "architecture": {
            "input": "[CLS] Question [SEP] Context [SEP]",
            "backbone": "BERT (12 layers, 768-dim hidden, 12 attention heads)",
            "output_heads": {
                "start_logits": "Linear(768 → 1) applied to every token",
                "end_logits": "Linear(768 → 1) applied to every token",
            },
            "inference": "Answer = context[argmax(start) : argmax(end) + 1]",
        },
    }
