"""
Text classification module.
Covers Word2Vec + ML classifier, BERT, and ModernBERT approaches
for predicting story country (China vs Northern Ireland).
"""

import re
import numpy as np
from typing import Dict
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from utils.data_loader import load_stories

RANDOM_SEED = 40499872
np.random.seed(RANDOM_SEED)

TARGET_COUNTRIES = ["China", "Northern Ireland"]

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "was", "are", "were",
    "it", "its", "he", "she", "they", "we", "i", "you",
}


def load_w2v_model():
    """
    Load pre-trained Word2Vec (Google News 300-dim vectors via gensim).
    Downloads ~1.6 GB on first call; cached locally by gensim.
    """
    import gensim.downloader as api
    return api.load("word2vec-google-news-300")


def get_story_embedding(story_text: str, w2v_model, stopwords: set) -> np.ndarray:
    """
    Average word2vec embeddings of non-stopword tokens.
    Returns a zero vector if no known words are found.
    """
    tokens = re.findall(r"[a-zA-Z']+", story_text.lower())
    vecs = [
        w2v_model[t]
        for t in tokens
        if t not in stopwords and t in w2v_model
    ]
    return np.mean(vecs, axis=0) if vecs else np.zeros(300)


def run_word2vec_classification() -> Dict:
    """
    Full pipeline: embed stories with Word2Vec, train Logistic Regression,
    evaluate on held-out test set. 70 / 15 / 15 train-val-test split.
    """
    stories = [
        s for s in load_stories() if s.get("country") in TARGET_COUNTRIES
    ]

    w2v = load_w2v_model()
    X = np.array([get_story_embedding(s["story"], w2v, STOPWORDS) for s in stories])
    y = np.array([1 if s["country"] == "China" else 0 for s in stories])

    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X, y, test_size=0.15, random_state=RANDOM_SEED, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval,
        test_size=0.15 / 0.85,
        random_state=RANDOM_SEED,
        stratify=y_trainval,
    )

    clf = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    clf.fit(X_train, y_train)

    val_acc = accuracy_score(y_val, clf.predict(X_val))
    test_preds = clf.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)
    report = classification_report(
        y_test, test_preds,
        target_names=["Northern Ireland", "China"],
        output_dict=True,
    )

    return {
        "method": "Word2Vec + Logistic Regression",
        "num_stories": len(stories),
        "train_size": len(X_train),
        "val_size": len(X_val),
        "test_size": len(X_test),
        "val_accuracy": round(val_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "classification_report": report,
    }


def get_bert_training_config() -> Dict:
    """BERT fine-tuning configuration (bert-base-uncased)."""
    return {
        "model_name": "bert-base-uncased",
        "num_labels": 2,
        "label_map": {"Northern Ireland": 0, "China": 1},
        "max_length": 512,
        "batch_size": 16,
        "learning_rate": 2e-5,
        "num_epochs": 5,
        "random_seed": RANDOM_SEED,
        "architecture": (
            "Input tokens → BERT Encoder (12 layers, 768 hidden) "
            "→ [CLS] embedding → Dropout(0.1) → Linear(768→2) → Softmax"
        ),
    }


def get_modernbert_config() -> Dict:
    """ModernBERT configuration with early stopping."""
    return {
        "model_name": "answerdotai/ModernBERT-base",
        "num_labels": 2,
        "label_map": {"Northern Ireland": 0, "China": 1},
        "max_length": 8192,
        "batch_size": 8,
        "learning_rate": 1e-5,
        "max_epochs": 10,
        "early_stopping_patience": 3,
        "random_seed": RANDOM_SEED,
        "key_improvements": [
            "Rotary Position Embeddings (RoPE)",
            "Flash Attention 2",
            "8192-token context window — no truncation needed",
            "Alternating global + local attention",
            "No next-sentence prediction objective",
        ],
    }
