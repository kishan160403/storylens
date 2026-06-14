from fastapi import APIRouter, HTTPException, Query
from models.dep_model import compute_all_dep_stats, compute_dep_stats_for_style, STYLES

router = APIRouter(prefix="/parsing", tags=["parsing"])
_cache: dict = {}


@router.get("/")
def get_all_dep_stats(max_stories: int = Query(50, ge=5, le=100)):
    key = f"all_{max_stories}"
    if key not in _cache:
        _cache[key] = compute_all_dep_stats(max_stories)
    return _cache[key]


@router.get("/{style}")
def get_dep_stats(style: str, max_stories: int = Query(50, ge=5, le=100)):
    if style not in STYLES:
        raise HTTPException(400, f"Unknown style. Choose from: {STYLES}")
    return compute_dep_stats_for_style(style, max_stories)
