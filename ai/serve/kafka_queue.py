import json
import os
import time
from dataclasses import dataclass
from typing import Any

from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError


@dataclass
class KafkaConfig:
    bootstrap_servers: str
    request_topic: str
    result_topic: str
    consumer_group: str


def build_kafka_config() -> KafkaConfig:
    return KafkaConfig(
        bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:29092"),
        request_topic=os.getenv("KAFKA_MODERATION_REQUEST_TOPIC", "moderation.request.v1"),
        result_topic=os.getenv("KAFKA_MODERATION_RESULT_TOPIC", "moderation.result.v1"),
        consumer_group=os.getenv("KAFKA_MODERATION_CONSUMER_GROUP", "ai-moderator-v1"),
    )


def build_producer(config: KafkaConfig) -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=config.bootstrap_servers,
        value_serializer=lambda value: json.dumps(value, ensure_ascii=False).encode("utf-8"),
        retries=5,
        acks="all",
        linger_ms=50,
    )


def build_consumer(config: KafkaConfig) -> KafkaConsumer:
    return KafkaConsumer(
        config.request_topic,
        bootstrap_servers=config.bootstrap_servers,
        group_id=config.consumer_group,
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
        consumer_timeout_ms=1000,
        max_poll_records=1,
    )


def wait_for_kafka(config: KafkaConfig, max_attempts: int = 30, sleep_seconds: float = 2.0) -> None:
    last_error: Exception | None = None
    for _ in range(max_attempts):
        try:
            producer = build_producer(config)
            producer.bootstrap_connected()
            producer.close()
            return
        except Exception as exc:  # pragma: no cover
            last_error = exc
            time.sleep(sleep_seconds)

    if last_error is not None:
        raise RuntimeError(f"Cannot connect to Kafka after retries: {last_error}") from last_error


def publish(producer: KafkaProducer, topic: str, payload: dict[str, Any]) -> None:
    try:
        future = producer.send(topic, payload)
        future.get(timeout=10)
    except KafkaError as exc:
        raise RuntimeError(f"Failed to publish message to {topic}: {exc}") from exc
