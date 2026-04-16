import os
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from serve.inference import ToxicInferenceService, build_default_service
from serve.kafka_queue import build_kafka_config, build_producer, publish


class PredictRequest(BaseModel):
    sentence: str = Field(..., min_length=1, max_length=5000)


class PredictResponse(BaseModel):
    sentence: str
    label: int
    confidence: float


class EnqueueModerationRequest(BaseModel):
    resource_type: str = Field(..., pattern="^(post|comment)$")
    resource_id: int = Field(..., gt=0)
    resource_uuid: Optional[str] = None
    user_id: int = Field(..., gt=0)
    sentence: str = Field(..., min_length=1, max_length=5000)
    reason: Optional[str] = None


class EnqueueModerationResponse(BaseModel):
    task_id: str
    status: str


app = FastAPI(title="Vietnamese Toxic Classifier API", version="1.0.0")
_service: Optional[ToxicInferenceService] = None
_service_error: Optional[str] = None
_producer = None


@app.on_event("startup")
def load_service() -> None:
    global _service, _service_error, _producer
    try:
        # Fallback mode keeps the API available if VnCoreNLP is temporarily unavailable.
        _service = build_default_service(strict_segment=False)
        _service_error = None
    except Exception as exc:  # pragma: no cover
        _service = None
        _service_error = str(exc)

    kafka_enabled = os.getenv("AI_ENABLE_KAFKA", "true").lower() == "true"
    if kafka_enabled:
        try:
            kafka_config = build_kafka_config()
            _producer = build_producer(kafka_config)
        except Exception as exc:  # pragma: no cover
            _producer = None
            if _service_error is None:
                _service_error = f"Kafka producer unavailable: {exc}"


@app.get("/health")
def health() -> dict:
    if _service is None:
        return {"status": "error", "detail": _service_error}
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict_api(req: PredictRequest) -> PredictResponse:
    if _service is None:
        raise HTTPException(status_code=503, detail=f"Service not ready: {_service_error}")

    result = _service.predict(req.sentence)
    return PredictResponse(**result)


@app.post("/moderation/enqueue", response_model=EnqueueModerationResponse)
def enqueue_moderation(
    req: EnqueueModerationRequest,
    x_moderation_api_key: Optional[str] = Header(default=None, alias="X-Moderation-Api-Key"),
) -> EnqueueModerationResponse:
    if _producer is None:
        raise HTTPException(status_code=503, detail="Kafka producer not ready")

    expected_api_key = os.getenv("AI_MODERATION_API_KEY", "")
    if expected_api_key and x_moderation_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid moderation API key")

    task_id = str(uuid4())
    payload = {
        "task_id": task_id,
        "resource_type": req.resource_type,
        "resource_id": req.resource_id,
        "resource_uuid": req.resource_uuid,
        "user_id": req.user_id,
        "sentence": req.sentence,
        "reason": req.reason,
        "enqueued_at": datetime.now(timezone.utc).isoformat(),
    }

    kafka_config = build_kafka_config()
    try:
        publish(_producer, kafka_config.request_topic, payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to enqueue moderation task: {exc}")

    return EnqueueModerationResponse(task_id=task_id, status="queued")
