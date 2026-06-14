"""
Zipf's Law analysis module.
Tests whether synthetic LLM-generated text obeys Zipf's law per writing style.
"""

import re
import numpy as np
from collections import Counter
from typing import Dict, List
from utils.data_loader import load_stories, STYLES

RANDOM_SEED = 40499872
np.random.seed(RANDOM_SEED)

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "was", "are", "were",
    "it", "its", "he", "she", "they", "we", "i", "you", "that",
    "this", "not", "be", "as", "had", "has", "have", "do", "did",
}


def tokenize(text: str) -> List[str]:
    """Lowercase and tokenize, removing punctuation."""
    return re.findall(r"[a-z']+", text.lower())


def compute_zipf_data(style: str) -> Dict:
    """
    Compute word frequency vs rank data for a given style.
    Returns log-rank, log-frequency arrays and top words for visualisation.
    """
    stories = [s for s in load_stories() if s.get("style") == style]
    all_words = []
    for story in stories:
        tokens = tokenize(story.get("story", ""))
        all_words.extend([w for w in tokens if w not in STOPWORDS and len(w) > 2])

    freq_table = Counter(all_words)
    sorted_freqs = sorted(freq_table.values(), reverse=True)

    ranks = np.arange(1, len(sorted_freqs) + 1)
    freqs = np.array(sorted_freqs)
    log_ranks = np.log10(ranks).tolist()
    log_freqs = np.log10(freqs).tolist()

    # Fit line to log-log for Zipf slope
    top_n = min(500, len(log_ranks))
    coeffs = np.polyfit(log_ranks[:top_n], log_freqs[:top_n], 1)
    slope = round(float(coeffs[0]), 4)
    intercept = round(float(coeffs[1]), 4)

    # Sample evenly for frontend (max 300 points)
    step = max(1, len(log_ranks) // 300)
    sampled_ranks = log_ranks[::step]
    sampled_freqs = log_freqs[::step]
    fitted = [slope * r + intercept for r in sampled_ranks]

    top_words = [{"word": w, "freq": c} for w, c in freq_table.most_common(20)]

    return {
        "style": style,
        "num_stories": len(stories),
        "vocab_size": len(freq_table),
        "total_tokens": len(all_words),
        "slope": slope,
        "intercept": intercept,
        "log_ranks": sampled_ranks,
        "log_freqs": sampled_freqs,
        "fitted_line": fitted,
        "top_words": top_words,
    }


def compute_all_zipf() -> Dict:
    """Compute Zipf data for all 6 styles."""
    return {style: compute_zipf_data(style) for style in STYLES}
