from fastapi import APIRouter, HTTPException
from models.sentiment_model import run_sentiment_analysis, run_emotion_analysis

router = APIRouter(prefix="/sentiment", tags=["sentiment"])
_cache: dict = {}


@router.get("/")
def get_sentiment(max_per_theme: int = 40):
    key = f"sent_{max_per_theme}"
    if key not in _cache:
        try:
            _cache[key] = run_sentiment_analysis(max_per_theme)
        except Exception as e:
            raise HTTPException(500, f"Sentiment analysis failed: {e}")
    return _cache[key]


@router.get("/emotion")
def get_emotions(max_per_theme: int = 30):
    key = f"emo_{max_per_theme}"
    if key not in _cache:
        try:
            _cache[key] = run_emotion_analysis(max_per_theme)
        except Exception as e:
            raise HTTPException(500, f"Emotion analysis failed: {e}")
    return _cache[key]
