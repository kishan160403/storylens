from fastapi import APIRouter
from models.style_model import compute_all_style_features

router = APIRouter(prefix="/style", tags=["style"])
_cache: dict = {}


@router.get("/")
def get_style_features(max_stories: int = 40):
    if "features" not in _cache:
        _cache["features"] = compute_all_style_features(max_stories)
    return _cache["features"]
