"""
Data loader for the StoryLens platform.
Place stories.json in the backend/ directory before starting the server.
"""

import json
from pathlib import Path
from functools import lru_cache
from typing import List, Dict, Any

# Resolve data path relative to this file — no hardcoded local paths
DATA_PATH = Path(__file__).parent.parent / "stories.json"

STYLES = [
    "legalistic",
    "descriptive",
    "hard-boiled",
    "stream of consciousness",
    "journalistic",
    "for children",
]
THEMES = [
    "political rebellion",
    "scientific discovery",
    "a dangerous voyage",
    "love",
    "a mysterious conspiracy",
]
COUNTRIES = ["USA", "China", "Northern Ireland", "Russia"]


@lru_cache(maxsize=1)
def load_stories() -> List[Dict[str, Any]]:
    """Load and cache the stories dataset from stories.json."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"stories.json not found at {DATA_PATH}. "
            "Please place stories.json in the backend/ directory."
        )
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_stories_by_style(style: str) -> List[Dict[str, Any]]:
    return [s for s in load_stories() if s.get("style") == style]


def get_stories_by_theme(theme: str) -> List[Dict[str, Any]]:
    return [s for s in load_stories() if s.get("theme") == theme]


def get_stories_by_country(country: str) -> List[Dict[str, Any]]:
    return [s for s in load_stories() if s.get("country") == country]
