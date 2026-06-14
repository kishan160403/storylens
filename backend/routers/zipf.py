from fastapi import APIRouter, HTTPException
from models.zipf_model import compute_zipf_data, compute_all_zipf, STYLES

router = APIRouter(prefix="/zipf", tags=["zipf"])
_cache: dict = {}


@router.get("/")
def get_all_zipf():
    if "all" not in _cache:
        _cache["all"] = compute_all_zipf()
    return _cache["all"]


@router.get("/{style}")
def get_zipf_for_style(style: str):
    if style not in STYLES:
        raise HTTPException(400, f"Unknown style. Choose from: {STYLES}")
    if style not in _cache:
        _cache[style] = compute_zipf_data(style)
    return _cache[style]
