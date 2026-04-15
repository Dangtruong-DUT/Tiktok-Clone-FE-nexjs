from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict

import numpy as np
import torch
import yaml
from sklearn.metrics import accuracy_score, f1_score
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    EvalPrediction,
    Trainer,
    TrainingArguments,
    set_seed,
)

from src.data.loaders import compute_pos_weight, load_stage_datasets
from src.training.losses import multilabel_bce_loss


class WeightedMultilabelTrainer(Trainer):
    def __init__(self, pos_weight: torch.Tensor | None = None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pos_weight = pos_weight

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.get("logits")
        loss = multilabel_bce_loss(logits, labels, self.pos_weight)
        return (loss, outputs) if return_outputs else loss


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train toxic multi-label model by stage")
    parser.add_argument("--stage", choices=["en", "vi", "mix"], required=True)
    parser.add_argument("--train-config", default="configs/train.yaml")
    parser.add_argument("--data-config", default="configs/data.yaml")
    parser.add_argument("--resume-from", default=None)
    return parser.parse_args()


def read_yaml(path: str) -> Dict:
    with open(path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def build_metrics_fn(threshold: float):
    def compute_metrics(pred: EvalPrediction) -> Dict[str, float]:
        logits = pred.predictions
        labels = pred.label_ids
        probs = 1.0 / (1.0 + np.exp(-logits))
        preds = (probs >= threshold).astype(int)

        macro_f1 = f1_score(labels, preds, average="macro", zero_division=0)
        micro_f1 = f1_score(labels, preds, average="micro", zero_division=0)
        exact_match = accuracy_score(labels, preds)
        return {
            "macro_f1": float(macro_f1),
            "micro_f1": float(micro_f1),
            "accuracy": float(exact_match),
        }

    return compute_metrics


def tokenize_dataset(dataset, tokenizer, max_length: int):
    def _tokenize(batch):
        return tokenizer(batch["text"], truncation=True, padding="max_length", max_length=max_length)

    return dataset.map(_tokenize, batched=True)


def resolve_model_name(stage: str, args: argparse.Namespace, train_cfg: Dict) -> str:
    if args.resume_from:
        return args.resume_from

    artifacts_root = Path(train_cfg["paths"]["artifacts_root"]) / train_cfg["paths"]["checkpoints_dir"]
    if stage == "vi":
        maybe = artifacts_root / train_cfg["stages"]["en"]["output_subdir"] / "best"
        return str(maybe) if maybe.exists() else train_cfg["base_model"]

    if stage == "mix":
        maybe = artifacts_root / train_cfg["stages"]["vi"]["output_subdir"] / "best"
        return str(maybe) if maybe.exists() else train_cfg["base_model"]

    return train_cfg["base_model"]


def main():
    args = parse_args()
    train_cfg = read_yaml(args.train_config)
    data_cfg = read_yaml(args.data_config)

    set_seed(int(train_cfg.get("seed", 42)))

    stage_cfg = train_cfg["stages"][args.stage]
    if not stage_cfg.get("enabled", True):
        raise ValueError(f"Stage '{args.stage}' is disabled in config")

    train_ds, valid_ds, test_ds, label_space = load_stage_datasets(data_cfg, args.stage)

    model_name = resolve_model_name(args.stage, args, train_cfg)
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    train_ds = tokenize_dataset(train_ds, tokenizer, int(train_cfg.get("max_length", 192)))
    valid_ds = tokenize_dataset(valid_ds, tokenizer, int(train_cfg.get("max_length", 192)))
    test_ds = tokenize_dataset(test_ds, tokenizer, int(train_cfg.get("max_length", 192)))

    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(label_space),
        problem_type="multi_label_classification",
    )

    class_cfg = data_cfg.get("class_balance", {})
    pos_weight = None
    if class_cfg.get("use_pos_weight", True):
        pw = compute_pos_weight(
            train_ds,
            clamp_min=float(class_cfg.get("clamp_min", 0.25)),
            clamp_max=float(class_cfg.get("clamp_max", 10.0)),
        )
        pos_weight = torch.tensor(pw, dtype=torch.float32, device=model.device)

    artifacts_root = Path(train_cfg["paths"]["artifacts_root"])
    checkpoint_dir = artifacts_root / train_cfg["paths"]["checkpoints_dir"] / stage_cfg["output_subdir"]
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    common_trainer_cfg = train_cfg.get("trainer", {})
    training_args = TrainingArguments(
        output_dir=str(checkpoint_dir),
        learning_rate=float(common_trainer_cfg.get("learning_rate", 2e-5)),
        weight_decay=float(common_trainer_cfg.get("weight_decay", 0.01)),
        warmup_ratio=float(common_trainer_cfg.get("warmup_ratio", 0.1)),
        num_train_epochs=float(stage_cfg.get("num_train_epochs", 3)),
        per_device_train_batch_size=int(stage_cfg.get("per_device_train_batch_size", 16)),
        per_device_eval_batch_size=int(stage_cfg.get("per_device_eval_batch_size", 32)),
        gradient_accumulation_steps=int(stage_cfg.get("gradient_accumulation_steps", 1)),
        fp16=bool(stage_cfg.get("fp16", False)),
        gradient_checkpointing=bool(stage_cfg.get("gradient_checkpointing", False)),
        logging_steps=int(common_trainer_cfg.get("logging_steps", 50)),
        evaluation_strategy=common_trainer_cfg.get("evaluation_strategy", "epoch"),
        save_strategy=common_trainer_cfg.get("save_strategy", "epoch"),
        save_total_limit=int(common_trainer_cfg.get("save_total_limit", 2)),
        load_best_model_at_end=bool(common_trainer_cfg.get("load_best_model_at_end", True)),
        metric_for_best_model=common_trainer_cfg.get("metric_for_best_model", "macro_f1"),
        greater_is_better=bool(common_trainer_cfg.get("greater_is_better", True)),
        report_to="none",
    )

    trainer = WeightedMultilabelTrainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=valid_ds,
        tokenizer=tokenizer,
        compute_metrics=build_metrics_fn(float(train_cfg.get("threshold_default", 0.5))),
        pos_weight=pos_weight,
    )

    trainer.train()
    test_metrics = trainer.evaluate(test_ds, metric_key_prefix="test")

    best_dir = checkpoint_dir / "best"
    best_dir.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(best_dir))
    tokenizer.save_pretrained(str(best_dir))

    metadata = {
        "stage": args.stage,
        "model_name_or_path": model_name,
        "label_space": label_space,
        "test_metrics": test_metrics,
        "train_size": len(train_ds),
        "valid_size": len(valid_ds),
        "test_size": len(test_ds),
    }

    with open(best_dir / "training_metadata.json", "w", encoding="utf-8") as file:
        json.dump(metadata, file, ensure_ascii=False, indent=2)

    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
