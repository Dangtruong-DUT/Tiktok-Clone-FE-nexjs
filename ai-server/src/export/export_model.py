from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

import yaml
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export trained model artifacts")
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--train-config", default="configs/train.yaml")
    parser.add_argument("--data-config", default="configs/data.yaml")
    parser.add_argument("--export-dir", default="artifacts/exports/latest")
    return parser.parse_args()


def read_yaml(path: str) -> Dict:
    with open(path, "r", encoding="utf-8") as file:
        return yaml.safe_load(file)


def main():
    args = parse_args()
    train_cfg = read_yaml(args.train_config)
    data_cfg = read_yaml(args.data_config)

    export_dir = Path(args.export_dir)
    export_dir.mkdir(parents=True, exist_ok=True)

    tokenizer = AutoTokenizer.from_pretrained(args.model_path)
    model = AutoModelForSequenceClassification.from_pretrained(args.model_path)

    model.save_pretrained(str(export_dir))
    tokenizer.save_pretrained(str(export_dir))

    label_space = data_cfg["label_space"]
    threshold = float(train_cfg.get("threshold_default", 0.5))
    threshold_map = {label: threshold for label in label_space}

    with open(export_dir / "label_map.json", "w", encoding="utf-8") as file:
        json.dump({"labels": label_space}, file, ensure_ascii=False, indent=2)

    with open(export_dir / "thresholds.json", "w", encoding="utf-8") as file:
        json.dump(threshold_map, file, ensure_ascii=False, indent=2)

    model_card = {
        "model_name": Path(args.model_path).name,
        "exported_at_utc": datetime.now(timezone.utc).isoformat(),
        "task": "multi-label toxic classification",
        "base_model": train_cfg.get("base_model", "xlm-roberta-base"),
        "label_space": label_space,
        "notes": "Trained with EN+VI multi-stage pipeline. Validate metrics in artifacts/reports before deployment.",
    }

    with open(export_dir / "model_card.json", "w", encoding="utf-8") as file:
        json.dump(model_card, file, ensure_ascii=False, indent=2)

    print(json.dumps({"export_dir": str(export_dir), "labels": label_space}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
