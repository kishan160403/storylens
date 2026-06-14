from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.qa_model import (
    process_annotated_story,
    run_squad_inference,
    build_qa_dataset,
    get_finetuning_config,
)

router = APIRouter(prefix="/qa", tags=["question-answering"])


@router.get("/story/{index}")
def get_story_qa(index: int):
    try:
        return process_annotated_story(index)
    except FileNotFoundError:
        raise HTTPException(
            404,
            "stories_annotated.json not found. Place it in the backend/ directory.",
        )
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/dataset/sample")
def get_qa_dataset_sample(n: int = 10):
    try:
        dataset = build_qa_dataset()
        return {"total": len(dataset), "sample": dataset[:n]}
    except FileNotFoundError:
        raise HTTPException(
            404,
            "stories_annotated.json required. Place it in the backend/ directory.",
        )


class QARequest(BaseModel):
    question: str
    context: str


@router.post("/ask")
def ask_question(req: QARequest):
    if not req.question.strip() or not req.context.strip():
        raise HTTPException(400, "Question and context must not be empty.")
    try:
        return run_squad_inference(req.question, req.context)
    except Exception as e:
        raise HTTPException(500, f"QA inference failed: {e}")


@router.get("/finetune-config")
def finetuning_config():
    return get_finetuning_config()
