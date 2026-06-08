import os
import logging
from datetime import datetime, timezone
from typing import Any

from serve.inference import ToxicInferenceService, build_default_service
from serve.kafka_queue import (
    build_consumer,
    build_kafka_config,
    build_producer,
    publish,
    wait_for_kafka,
)


def configure_logging() -> None:
    logging.basicConfig(
        level=os.getenv("AI_LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    logging.getLogger("transformers").setLevel(logging.ERROR)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("kafka").setLevel(logging.WARNING)


class ModerationWorker:
    def __init__(self, service: ToxicInferenceService) -> None:
        self.service = service
        self.config = build_kafka_config()
        self.violation_threshold = float(os.getenv("AI_VIOLATION_THRESHOLD", "0.8"))
        self.review_threshold = float(os.getenv("AI_REVIEW_THRESHOLD", "0.5"))

    def run(self) -> None:
        logger = logging.getLogger("ai.serve.worker")

        wait_for_kafka(self.config)
        producer = build_producer(self.config)
        consumer = build_consumer(self.config)

        logger.info("event=worker_start status=ok")
        try:
            for message in consumer:
                payload = message.value
                logger.info(
                    "event=moderation_consume_request request_id=%s task_id=%s resource_type=%s resource_id=%s",
                    payload.get("request_id"),
                    payload.get("task_id"),
                    payload.get("resource_type"),
                    payload.get("resource_id"),
                )

                result = self._handle_payload(payload)

                publish(producer, self.config.result_topic, result)
                logger.info(
                    "event=moderation_publish_result request_id=%s task_id=%s label=%s confidence=%.6f is_violation=%s",
                    result.get("request_id"),
                    result.get("task_id"),
                    result.get("label"),
                    float(result.get("confidence", 0.0)),
                    result.get("is_violation"),
                )

                consumer.commit()
        finally:
            producer.close()
            consumer.close()

    def _handle_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        sentence = str(payload.get("sentence", ""))
        prediction = self.service.predict(sentence)

        label = int(prediction["label"])
        confidence = float(prediction["confidence"])
        is_violation = label == 1 and confidence >= self.violation_threshold
        needs_review = (
            label == 1
            and self.review_threshold <= confidence < self.violation_threshold
        )

        result = {
            "request_id": payload.get("request_id"),
            "task_id": payload.get("task_id"),
            "resource_type": payload.get("resource_type"),
            "resource_id": payload.get("resource_id"),
            "resource_updated_at": payload.get("resource_updated_at"),
            "user_id": payload.get("user_id"),
            "sentence": sentence,
            "label": label,
            "confidence": confidence,
            "is_violation": is_violation,
            "needs_review": needs_review,
            "reason": (
                "Potential toxic content detected by AI moderation." if is_violation
                else "Borderline content flagged for manual review." if needs_review
                else None
            ),
            "moderated_at": datetime.now(timezone.utc).isoformat(),
            "raw_payload": payload,
        }

        return result

def main() -> None:
    configure_logging()
    service = build_default_service()
    worker = ModerationWorker(service=service)
    worker.run()


if __name__ == "__main__":
    main()
