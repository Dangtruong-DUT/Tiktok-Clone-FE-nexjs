from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict

import numpy as np
import yaml
from sklearn.metrics import accuracy_score, average_precision_score, f1_score
from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments

from src.data.loaders import load_stage_datasets, split_eval_by_language


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate trained multi-label model")
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--stage", choices=["en", "vi", "mix"], default="mix")
    parser.add_argument("--train-config", default="configs/train.yaml")
    parser.add_argument("--data-config", default="configs/data.yaml")
    parser.add_argument("--output", default="artifacts/reports/eval_report.json")
    return parser.parse_args()


def read_yaml(path: str) -> Dict:
    with open(path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def _tokenize_dataset(dataset, tokenizer, max_length: int):
    return dataset.map(
        lambda batch: tokenizer(batch["text"], truncation=True, padding="max_length", max_length=max_length),
        batched=True,
    )


def compute_multi_label_metrics(labels: np.ndarray, logits: np.ndarray, threshold: float) -> Dict[str, float]:
    probs = 1.0 / (1.0 + np.exp(-logits))
    preds = (probs >= threshold).astype(int)

    result = {
        "accuracy": float(accuracy_score(labels, preds)),
        "macro_f1": float(f1_score(labels, preds, average="macro", zero_division=0)),
        "micro_f1": float(f1_score(labels, preds, average="micro", zero_division=0)),
    }

    try:
        result["macro_pr_auc"] = float(average_precision_score(labels, probs, average="macro"))
    except ValueError:
        result["macro_pr_auc"] = 0.0

    per_label_f1 = f1_score(labels, preds, average=None, zero_division=0)
    for idx, score in enumerate(per_label_f1):
        result[f"label_{idx}_f1"] = float(score)

    return result


def main():
    args = parse_args()
    train_cfg = read_yaml(args.train_config)
    data_cfg = read_yaml(args.data_config)

    _, _, test_ds, label_space = load_stage_datasets(data_cfg, args.stage)
    subsets = split_eval_by_language(test_ds)

    tokenizer = AutoTokenizer.from_pretrained(args.model_path)
    model = AutoModelForSequenceClassification.from_pretrained(args.model_path)
    max_length = int(train_cfg.get("max_length", 192))

    dummy_args = TrainingArguments(output_dir="artifacts/tmp_eval", report_to="none")
    trainer = Trainer(model=model, args=dummy_args, tokenizer=tokenizer)

    threshold = float(train_cfg.get("threshold_default", 0.5))
    report = {"label_space": label_space, "threshold": threshold, "subsets": {}}

    for subset_name, subset_ds in subsets.items():
        tokenized = _tokenize_dataset(subset_ds, tokenizer, max_length)
        outputs = trainer.predict(tokenized)
        labels = np.array(tokenized["labels"], dtype=np.int32)
        metrics = compute_multi_label_metrics(labels, outputs.predictions, threshold)
        metrics["size"] = len(tokenized)
        report["subsets"][subset_name] = metrics

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(report, file, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
