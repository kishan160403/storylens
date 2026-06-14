"""
Dependency parsing analysis module.
Measures max dependency span as a proxy for syntactic complexity.
"""

import numpy as np
import spacy
from typing import Dict
from utils.data_loader import load_stories, STYLES

RANDOM_SEED = 40499872
np.random.seed(RANDOM_SEED)

# Run: python -m spacy download en_core_web_sm
nlp = spacy.load("en_core_web_sm", disable=["ner"])


def max_dependency_span(sent) -> int:
    """
    Length of the longest dependency arc in a sentence.
    Computed as max(|head.i - token.i|) over all tokens.
    """
    spans = [abs(token.head.i - token.i) for token in sent if token.head != token]
    return max(spans) if spans else 0


def compute_dep_stats_for_style(style: str, max_stories: int = 50) -> Dict:
    """Compute max_dep values for all sentences in stories of a given style."""
    stories = [s for s in load_stories() if s.get("style") == style][:max_stories]
    max_deps = []

    for story in stories:
        doc = nlp(story.get("story", "")[:100000])
        for sent in doc.sents:
            val = max_dependency_span(sent)
            if val > 0:
                max_deps.append(val)

    arr = np.array(max_deps, dtype=float)
    return {
        "style": style,
        "num_sentences": len(max_deps),
        "mean": round(float(np.mean(arr)), 3) if len(arr) > 0 else 0,
        "median": round(float(np.median(arr)), 3) if len(arr) > 0 else 0,
        "std": round(float(np.std(arr)), 3) if len(arr) > 0 else 0,
        "values": arr.tolist(),
    }


def compute_all_dep_stats(max_stories_per_style: int = 50) -> Dict:
    """Compute dependency stats for all styles."""
    return {
        style: compute_dep_stats_for_style(style, max_stories_per_style)
        for style in STYLES
    }
