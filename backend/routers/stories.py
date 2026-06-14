from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from utils.data_loader import load_stories, STYLES, THEMES, COUNTRIES

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get("/")
def get_stories(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    style: Optional[str] = None,
    theme: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
):
    stories = load_stories()

    if style:
        stories = [s for s in stories if s.get("style") == style]
    if theme:
        stories = [s for s in stories if s.get("theme") == theme]
    if country:
        stories = [s for s in stories if s.get("country") == country]
    if search:
        q = search.lower()
        stories = [
            s for s in stories
            if q in s.get("story", "").lower() or q in s.get("theme", "").lower()
        ]

    total = len(stories)
    start = (page - 1) * limit
    cards = [
        {
            "index": s.get("index"),
            "theme": s.get("theme"),
            "style": s.get("style"),
            "country": s.get("country"),
            "person": s.get("person"),
            "setting": s.get("setting"),
            "preview": s.get("story", "")[:200] + "...",
        }
        for s in stories[start : start + limit]
    ]

    return {"total": total, "page": page, "limit": limit, "stories": cards}


@router.get("/metadata")
def get_metadata():
    return {"styles": STYLES, "themes": THEMES, "countries": COUNTRIES}


@router.get("/{index}")
def get_story(index: int):
    story = next((s for s in load_stories() if s.get("index") == index), None)
    if not story:
        raise HTTPException(status_code=404, detail=f"Story {index} not found")
    return story
