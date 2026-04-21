# AI Serve (PhoBERT Toxic Classification)

Production-ready inference service for Vietnamese toxic classification.

## Pipeline

1. Clean raw Vietnamese text
2. Segment text with VnCoreNLP
3. Tokenize with PhoBERT tokenizer
4. Predict toxic label with PhoBERT classifier

## Environment Variables

- `AI_MODEL_NAME` (default: `vinai/phobert-base`)
- `AI_MODEL_PATH` (default: `models/best_phobert_model.pt`)
- `AI_MAX_LENGTH` (default: `256`)
- `AI_DEVICE` (default: `auto`)
- `VNCORENLP_JAR_PATH` (required in strict mode)
- `VNCORENLP_MAX_HEAP_SIZE` (default: `-Xmx2g`)
- `AI_MODERATION_API_KEY` (optional shared secret for enqueue endpoint)
- `AI_ENABLE_KAFKA` (default: `true`)
- `KAFKA_BOOTSTRAP_SERVERS` (default: `kafka:9092`)
- `KAFKA_MODERATION_REQUEST_TOPIC` (default: `moderation.request.v1`)
- `KAFKA_MODERATION_RESULT_TOPIC` (default: `moderation.result.v1`)
- `KAFKA_MODERATION_CONSUMER_GROUP` (default: `ai-moderator-v1`)
- `AI_VIOLATION_THRESHOLD` (default: `0.8`)
- `AI_LOG_LEVEL` (default: `INFO`)

## Logging

API and worker now log request/result pairs with `request_id` so you can trace each moderation flow:

- API `/predict`: `predict_request` -> `predict_result`
- API `/moderation/enqueue`: `moderation_enqueue_request` -> `moderation_enqueue_result`
- Worker consume/publish: `moderation_consume_request` -> `moderation_publish_result`

Example log fields include: `request_id`, `task_id`, `resource_type`, `resource_id`, `label`, `confidence`, `is_violation`.

## Run API

From the `ai/` folder:

```bash
uvicorn serve.api:app --host 0.0.0.0 --port 8001
```

## Run Sequential Moderation Worker

```bash
python -m serve.moderation_worker
```

Worker behavior:

1. Consume one message at a time from `moderation.request.v1`
2. Run clean + segment + tokenize + predict pipeline
3. Publish verdict to `moderation.result.v1`
4. Laravel moderation consumer reads `moderation.result.v1` and applies verdict

## Python Usage

```python
from serve.inference import predict

result = predict("đồ ngu như mày")
# {"sentence": "đồ ngu như mày", "label": 1, "confidence": 0.95}
```
