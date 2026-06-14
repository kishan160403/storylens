"""
StoryLens — NLP Intelligence Platform
Backend API built with FastAPI.

Setup:
    cd backend
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    # Place stories.json (and optionally stories_annotated.json) here
    uvicorn main:app --reload --port 8000

API docs available at http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import stories, zipf, parsing, style, classify, sentiment, qa

app = FastAPI(
    title="StoryLens API",
    description=(
        "NLP Intelligence Platform — explore 602 synthetic stories with "
        "Zipf's law analysis, dependency parsing, stylometric features, "
        "BERT text classification, sentiment/emotion detection, and "
        "extractive question answering."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stories.router, prefix="/api")
app.include_router(zipf.router, prefix="/api")
app.include_router(parsing.router, prefix="/api")
app.include_router(style.router, prefix="/api")
app.include_router(classify.router, prefix="/api")
app.include_router(sentiment.router, prefix="/api")
app.include_router(qa.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "project": "StoryLens"}
