import os
import logging
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
_logger = logging.getLogger("ai.serve.api")


def _truncate_text(value: str, limit: int = 200) -> str:
    if len(value) <= limit:
        return value
    return f"{value[:limit]}..."


@app.on_event("startup")
def load_service() -> None:
    global _service, _service_error, _producer
    logging.basicConfig(
        level=os.getenv("AI_LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

    try:
        # Fallback mode keeps the API available if VnCoreNLP is temporarily unavailable.
        _service = build_default_service(strict_segment=False)
        _service_error = None
        _logger.info("event=service_startup status=ok")
    except Exception as exc:  # pragma: no cover
        _service = None
        _service_error = str(exc)
        _logger.exception("event=service_startup status=error detail=%s", _service_error)

    kafka_enabled = os.getenv("AI_ENABLE_KAFKA", "true").lower() == "true"
    if kafka_enabled:
        try:
            kafka_config = build_kafka_config()
            _producer = build_producer(kafka_config)
            _logger.info("event=kafka_producer_startup status=ok topic=%s", kafka_config.request_topic)
        except Exception as exc:  # pragma: no cover
            _producer = None
            if _service_error is None:
                _service_error = f"Kafka producer unavailable: {exc}"
            _logger.exception("event=kafka_producer_startup status=error detail=%s", exc)


@app.get("/health")
def health() -> dict:
    if _service is None:
        return {"status": "error", "detail": _service_error}
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict_api(req: PredictRequest) -> PredictResponse:
    request_id = str(uuid4())
    if _service is None:
        _logger.error("event=predict status=service_not_ready request_id=%s", request_id)
        raise HTTPException(status_code=503, detail=f"Service not ready: {_service_error}")

    _logger.info(
        "event=predict_request request_id=%s sentence=%s",
        request_id,
        _truncate_text(req.sentence),
    )

    result = _service.predict(req.sentence)
    _logger.info(
        "event=predict_result request_id=%s label=%s confidence=%.6f",
        request_id,
        result.get("label"),
        float(result.get("confidence", 0.0)),
    )
    return PredictResponse(**result)


@app.post("/moderation/enqueue", response_model=EnqueueModerationResponse)
def enqueue_moderation(
    req: EnqueueModerationRequest,
    x_moderation_api_key: Optional[str] = Header(default=None, alias="X-Moderation-Api-Key"),
) -> EnqueueModerationResponse:
    request_id = str(uuid4())

    if _producer is None:
        _logger.error("event=moderation_enqueue status=producer_not_ready request_id=%s", request_id)
        raise HTTPException(status_code=503, detail="Kafka producer not ready")

    expected_api_key = os.getenv("AI_MODERATION_API_KEY", "")
    if expected_api_key and x_moderation_api_key != expected_api_key:
        _logger.warning("event=moderation_enqueue status=unauthorized request_id=%s", request_id)
        raise HTTPException(status_code=401, detail="Invalid moderation API key")

    task_id = str(uuid4())
    payload = {
        "task_id": task_id,
        "request_id": request_id,
        "resource_type": req.resource_type,
        "resource_id": req.resource_id,
        "resource_uuid": req.resource_uuid,
        "user_id": req.user_id,
        "sentence": req.sentence,
        "reason": req.reason,
        "enqueued_at": datetime.now(timezone.utc).isoformat(),
    }

    _logger.info(
        "event=moderation_enqueue_request request_id=%s task_id=%s resource_type=%s resource_id=%s sentence=%s",
        request_id,
        task_id,
        req.resource_type,
        req.resource_id,
        _truncate_text(req.sentence),
    )

    kafka_config = build_kafka_config()
    try:
        publish(_producer, kafka_config.request_topic, payload)
    except Exception as exc:
        _logger.exception(
            "event=moderation_enqueue_result request_id=%s task_id=%s status=error detail=%s",
            request_id,
            task_id,
            exc,
        )
        raise HTTPException(status_code=500, detail=f"Failed to enqueue moderation task: {exc}")

    _logger.info(
        "event=moderation_enqueue_result request_id=%s task_id=%s status=queued topic=%s",
        request_id,
        task_id,
        kafka_config.request_topic,
    )

    return EnqueueModerationResponse(task_id=task_id, status="queued")
