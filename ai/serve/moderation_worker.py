import os
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


class ModerationWorker:
    def __init__(self, service: ToxicInferenceService) -> None:
        self.service = service
        self.config = build_kafka_config()
        self.violation_threshold = float(os.getenv("AI_VIOLATION_THRESHOLD", "0.8"))

    def run(self) -> None:
        wait_for_kafka(self.config)
        producer = build_producer(self.config)
        consumer = build_consumer(self.config)

        print("[ai-worker] started")
        try:
            for message in consumer:
                payload = message.value
                result = self._handle_payload(payload)

                publish(producer, self.config.result_topic, result)

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

        result = {
            "task_id": payload.get("task_id"),
            "resource_type": payload.get("resource_type"),
            "resource_id": payload.get("resource_id"),
            "resource_uuid": payload.get("resource_uuid"),
            "user_id": payload.get("user_id"),
            "sentence": sentence,
            "label": label,
            "confidence": confidence,
            "is_violation": is_violation,
            "reason": payload.get("reason") or "Potential toxic content detected by AI moderation.",
            "moderated_at": datetime.now(timezone.utc).isoformat(),
            "raw_payload": payload,
        }

        return result

def main() -> None:
    strict_segment = os.getenv("AI_STRICT_SEGMENT", "true").lower() == "true"
    service = build_default_service(strict_segment=strict_segment)
    worker = ModerationWorker(service=service)
    worker.run()


if __name__ == "__main__":
    main()
