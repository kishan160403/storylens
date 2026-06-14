from fastapi import APIRouter, HTTPException
from models.classifier import (
    run_word2vec_classification,
    get_bert_training_config,
    get_modernbert_config,
)

router = APIRouter(prefix="/classify", tags=["classification"])
_results: dict = {}


@router.get("/w2v")
def word2vec_classification():
    """Word2Vec + Logistic Regression. First call downloads ~1.6 GB Word2Vec model."""
    if "w2v" not in _results:
        try:
            _results["w2v"] = run_word2vec_classification()
        except Exception as e:
            raise HTTPException(500, f"Classification failed: {e}")
    return _results["w2v"]


@router.get("/bert-config")
def bert_config():
    return get_bert_training_config()


@router.get("/modernbert-config")
def modernbert_config():
    return get_modernbert_config()
