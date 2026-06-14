"""
Sentiment and emotion analysis module.
Uses pre-trained HuggingFace models for inference.
"""

import re
import numpy as np
from collections import defaultdict
from typing import Dict, List
from utils.data_loader import load_stories, THEMES

RANDOM_SEED = 40499872
np.random.seed(RANDOM_SEED)

SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
EMOTION_MODEL_1 = "cardiffnlp/twitter-roberta-base-emotion-multilabel-latest"
EMOTION_MODEL_2 = "j-hartmann/emotion-english-distilroberta-base"


def _get_last_sentence(text: str) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return sentences[-1] if sentences else text[:200]


def run_sentiment_analysis(max_per_theme: int = 40) -> Dict:
    """
    Score the last sentence of each story by theme using a RoBERTa
    sentiment model. Returns average sentiment probabilities per theme.
    """
    from transformers import pipeline

    pipe = pipeline(
        "sentiment-analysis",
        model=SENTIMENT_MODEL,
        top_k=None,
        truncation=True,
        max_length=512,
    )

    results = {}
    for theme in THEMES:
        stories = [s for s in load_stories() if s.get("theme") == theme][:max_per_theme]
        last_sents = [_get_last_sentence(s.get("story", "")) for s in stories]
        scores = defaultdict(list)

        for batch in [last_sents[i : i + 8] for i in range(0, len(last_sents), 8)]:
            for out in pipe(batch):
                for item in out:
                    scores[item["label"]].append(item["score"])

        results[theme] = {
            label: round(float(np.mean(vals)), 4)
            for label, vals in scores.items()
        }

    return {"model": SENTIMENT_MODEL, "results": results}


def run_emotion_analysis(max_per_theme: int = 30) -> Dict:
    """
    Detect emotions per theme using two HuggingFace models.
    Scores are averaged over all sentences in each story, then over stories per theme.
    """
    from transformers import pipeline

    def _analyse(model_name: str) -> Dict:
        pipe = pipeline(
            "text-classification",
            model=model_name,
            top_k=None,
            truncation=True,
            max_length=512,
        )
        theme_emotions = {}
        for theme in THEMES:
            stories = [
                s for s in load_stories() if s.get("theme") == theme
            ][:max_per_theme]
            all_scores = defaultdict(list)

            for story in stories:
                sentences = re.split(r"(?<=[.!?])\s+", story.get("story", ""))
                for batch in [sentences[:10][i : i + 4] for i in range(0, min(10, len(sentences)), 4)]:
                    try:
                        for out in pipe(batch):
                            for item in out:
                                all_scores[item["label"]].append(item["score"])
                    except Exception:
                        pass

            theme_emotions[theme] = {
                label: round(float(np.mean(vals)), 4)
                for label, vals in all_scores.items()
            }
        return theme_emotions

    return {
        "model_1": {"name": EMOTION_MODEL_1, "results": _analyse(EMOTION_MODEL_1)},
        "model_2": {"name": EMOTION_MODEL_2, "results": _analyse(EMOTION_MODEL_2)},
    }
