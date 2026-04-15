from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run quick inference smoke test")
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--text", action="append", help="Input text for prediction", default=[])
    parser.add_argument("--threshold", type=float, default=0.5)
    return parser.parse_args()


def main():
    args = parse_args()
    model_path = Path(args.model_path)

    if not args.text:
        args.text = [
            "ban noi linh tinh vai, ngu vl",
            "ban lam viec rat tot, cam on nhe",
            "you are so stupid and disgusting",
        ]

    with open(model_path / "label_map.json", "r", encoding="utf-8") as file:
        label_space = json.load(file)["labels"]

    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
    model.eval()

    encoded = tokenizer(args.text, truncation=True, padding=True, return_tensors="pt")
    with torch.no_grad():
        logits = model(**encoded).logits
        probs = torch.sigmoid(logits).cpu().numpy()

    results = []
    for idx, text in enumerate(args.text):
        scored = {label_space[j]: float(probs[idx][j]) for j in range(len(label_space))}
        predicted = [label for label, score in scored.items() if score >= args.threshold]
        results.append({"text": text, "predicted_labels": predicted, "scores": scored})

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
