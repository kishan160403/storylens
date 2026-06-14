"""
Writing style quantification module.
Computes 10 stylometric features to discriminate between writing styles.
"""

import re
import numpy as np
import spacy
from collections import Counter
from typing import Dict, List
from utils.data_loader import load_stories, STYLES

RANDOM_SEED = 40499872
np.random.seed(RANDOM_SEED)

nlp = spacy.load("en_core_web_sm", disable=["ner"])


def compute_style_features(text: str) -> Dict:
    """
    Compute stylometric features for a text:
      1. avg_word_length       — mean characters per word
      2. avg_sentence_length   — mean words per sentence
      3. type_token_ratio      — vocabulary richness (unique / total)
      4. punct_density         — punctuation marks per 100 tokens
      5. passive_ratio         — fraction of sentences containing passive voice
      6. noun_ratio            — nouns as fraction of all POS tokens
      7. adj_ratio             — adjectives as fraction of all POS tokens
      8. adv_ratio             — adverbs as fraction of all POS tokens
      9. verb_ratio            — verbs as fraction of all POS tokens
     10. comma_per_sentence    — average commas per sentence
    """
    doc = nlp(text[:50000])
    tokens = [t for t in doc if not t.is_space]
    words = [t for t in tokens if t.is_alpha]
    sents = list(doc.sents)

    if not words or not sents:
        return {}

    avg_word_length = np.mean([len(w.text) for w in words])
    avg_sent_length = len(words) / len(sents)
    ttr = len(set(w.lower_ for w in words)) / len(words)
    punct = [t for t in tokens if t.is_punct]
    punct_density = len(punct) / len(tokens) * 100

    passive = sum(
        1 for sent in sents if any(t.dep_ == "auxpass" for t in sent)
    )
    passive_ratio = passive / len(sents)

    pos_counts = Counter(t.pos_ for t in words)
    total_pos = len(words)
    noun_ratio = pos_counts.get("NOUN", 0) / total_pos
    adj_ratio = pos_counts.get("ADJ", 0) / total_pos
    adv_ratio = pos_counts.get("ADV", 0) / total_pos
    verb_ratio = pos_counts.get("VERB", 0) / total_pos
    comma_per_sent = sum(1 for t in tokens if t.text == ",") / len(sents)

    return {
        "avg_word_length": round(avg_word_length, 3),
        "avg_sentence_length": round(avg_sent_length, 3),
        "type_token_ratio": round(ttr, 4),
        "punct_density": round(punct_density, 3),
        "passive_ratio": round(passive_ratio, 4),
        "noun_ratio": round(noun_ratio, 4),
        "adj_ratio": round(adj_ratio, 4),
        "adv_ratio": round(adv_ratio, 4),
        "verb_ratio": round(verb_ratio, 4),
        "comma_per_sentence": round(comma_per_sent, 3),
    }


def aggregate_style_features(style: str, max_stories: int = 40) -> Dict:
    """Compute mean stylometric features across stories of a given style."""
    stories = [s for s in load_stories() if s.get("style") == style][:max_stories]
    features_list = [compute_style_features(s.get("story", "")) for s in stories]
    features_list = [f for f in features_list if f]

    if not features_list:
        return {"style": style}

    keys = features_list[0].keys()
    aggregated = {
        k: round(float(np.mean([f[k] for f in features_list])), 4)
        for k in keys
    }
    aggregated["style"] = style
    aggregated["num_stories"] = len(features_list)
    return aggregated


def compute_all_style_features(max_stories: int = 40) -> List[Dict]:
    """Compute style features for all styles."""
    return [aggregate_style_features(style, max_stories) for style in STYLES]
