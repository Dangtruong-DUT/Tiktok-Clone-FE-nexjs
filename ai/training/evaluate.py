import json
from pathlib import Path

import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from transformers import AutoModel, AutoTokenizer

MODEL_NAME = "vinai/phobert-base"
MAX_LEN = 256
BATCH_SIZE = 32
BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models/best_phobert_model.pt"
TEST_PATH = BASE_DIR / "data/processed/balanced/test.csv"
OUT_DIR = BASE_DIR / "training/eval_outputs"
OUT_DIR.mkdir(parents=True, exist_ok=True)


class PhoBERTClassifier(nn.Module):
    def __init__(self, model_name: str, num_labels: int = 2, dropout: float = 0.2) -> None:
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(self.encoder.config.hidden_size, num_labels)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0, :]
        return self.classifier(self.dropout(pooled))


def main() -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    df = pd.read_csv(TEST_PATH, encoding="utf-8-sig")
    texts = df["sentences"].astype(str).tolist()
    labels = df["toxic"].astype(int).tolist()

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = PhoBERTClassifier(model_name=MODEL_NAME).to(device)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()

    preds = []
    with torch.no_grad():
        for i in range(0, len(texts), BATCH_SIZE):
            batch_texts = texts[i : i + BATCH_SIZE]
            encoded = tokenizer(
                batch_texts,
                padding=True,
                truncation=True,
                max_length=MAX_LEN,
                return_tensors="pt",
            )
            input_ids = encoded["input_ids"].to(device)
            attention_mask = encoded["attention_mask"].to(device)
            logits = model(input_ids=input_ids, attention_mask=attention_mask)
            batch_preds = torch.argmax(logits, dim=1).cpu().tolist()
            preds.extend(batch_preds)

    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels,
        preds,
        average="binary",
        zero_division=0,
    )
    cm = confusion_matrix(labels, preds)

    eval_df = df.copy()
    eval_df["pred"] = preds
    eval_df["error_type"] = "correct"
    eval_df.loc[(eval_df["toxic"] == 0) & (eval_df["pred"] == 1), "error_type"] = "false_positive"
    eval_df.loc[(eval_df["toxic"] == 1) & (eval_df["pred"] == 0), "error_type"] = "false_negative"

    fp_df = eval_df[eval_df["error_type"] == "false_positive"]
    fn_df = eval_df[eval_df["error_type"] == "false_negative"]

    metrics = {
        "accuracy": float(acc),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": {
            "tn": int(cm[0, 0]),
            "fp": int(cm[0, 1]),
            "fn": int(cm[1, 0]),
            "tp": int(cm[1, 1]),
            "matrix": cm.tolist(),
        },
        "num_samples": int(len(eval_df)),
        "num_false_positive": int(len(fp_df)),
        "num_false_negative": int(len(fn_df)),
    }

    with (OUT_DIR / "metrics.json").open("w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    fp_df[["sentences", "toxic", "pred"]].to_csv(
        OUT_DIR / "false_positives.csv",
        index=False,
        encoding="utf-8-sig",
    )
    fn_df[["sentences", "toxic", "pred"]].to_csv(
        OUT_DIR / "false_negatives.csv",
        index=False,
        encoding="utf-8-sig",
    )

    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
