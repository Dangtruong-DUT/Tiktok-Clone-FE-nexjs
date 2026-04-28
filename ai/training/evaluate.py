import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.calibration import calibration_curve
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_recall_fscore_support,
    precision_score,
    recall_score,
    roc_curve,
    auc,
)
from transformers import AutoModel, AutoTokenizer


matplotlib.use("Agg")

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

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
    model = PhoBERTClassifier(model_name=MODEL_NAME).to(device)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()

    preds = []
    probs = []
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
            prob_pos = torch.softmax(logits, dim=1)[:, 1]
            batch_preds = torch.argmax(logits, dim=1).cpu().tolist()
            probs.extend(prob_pos.detach().cpu().numpy().tolist())
            preds.extend(batch_preds)

    acc = accuracy_score(labels, preds)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels,
        preds,
        average="binary",
        zero_division=0,
    )
    cm = confusion_matrix(labels, preds, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel().tolist()

    eval_df = df.copy()
    eval_df["pred"] = preds
    eval_df["prob"] = probs
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

    fp_df[["sentences", "toxic", "pred", "prob"]].to_csv(
        OUT_DIR / "false_positives.csv",
        index=False,
        encoding="utf-8-sig",
    )
    fn_df[["sentences", "toxic", "pred", "prob"]].to_csv(
        OUT_DIR / "false_negatives.csv",
        index=False,
        encoding="utf-8-sig",
    )

    eval_df[["sentences", "toxic", "pred", "prob", "error_type"]].to_csv(
        OUT_DIR / "errors.csv",
        index=False,
        encoding="utf-8-sig",
    )

    print(f"Confusion Matrix: TN={tn} FP={fp} FN={fn} TP={tp}")

    # Confusion Matrix (raw + normalized)
    labels_text = ["Non-toxic", "Toxic"]
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels_text,
        yticklabels=labels_text,
        ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix")
    fig.tight_layout()
    fig.savefig(OUT_DIR / "confusion_matrix.png", dpi=150)
    plt.close(fig)

    cm_norm = cm.astype(float)
    row_sums = cm_norm.sum(axis=1, keepdims=True)
    cm_norm = np.divide(cm_norm, row_sums, out=np.zeros_like(cm_norm), where=row_sums != 0)
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        cm_norm,
        annot=True,
        fmt=".2%",
        cmap="Blues",
        xticklabels=labels_text,
        yticklabels=labels_text,
        ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title("Confusion Matrix (Normalized)")
    fig.tight_layout()
    fig.savefig(OUT_DIR / "confusion_matrix_normalized.png", dpi=150)
    plt.close(fig)

    has_both_classes = len(set(labels)) > 1

    # ROC Curve
    if has_both_classes:
        fpr, tpr, roc_thresholds = roc_curve(labels, probs)
        roc_auc = auc(fpr, tpr)

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.plot(fpr, tpr, label=f"ROC (AUC={roc_auc:.4f})")
        ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Random")

        default_pred = [1 if p >= 0.5 else 0 for p in probs]
        tp_rate = recall_score(labels, default_pred, zero_division=0)
        fp_rate = 0.0
        if (labels.count(0)) > 0:
            fp_rate = sum(
                1 for y, p in zip(labels, default_pred) if y == 0 and p == 1
            ) / max(labels.count(0), 1)
        ax.scatter([fp_rate], [tp_rate], color="red", label="Threshold=0.5")

        ax.set_xlabel("False Positive Rate")
        ax.set_ylabel("True Positive Rate")
        ax.set_title("ROC Curve")
        ax.legend(loc="lower right")
        fig.tight_layout()
        fig.savefig(OUT_DIR / "roc_curve.png", dpi=150)
        plt.close(fig)

    # Precision-Recall Curve
    if has_both_classes:
        precision_curve, recall_curve, pr_thresholds = precision_recall_curve(labels, probs)
        ap = average_precision_score(labels, probs)

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.plot(recall_curve, precision_curve, label=f"PR (AP={ap:.4f})")

        default_pred = [1 if p >= 0.5 else 0 for p in probs]
        p_at = precision_score(labels, default_pred, zero_division=0)
        r_at = recall_score(labels, default_pred, zero_division=0)
        ax.scatter([r_at], [p_at], color="red", label="Threshold=0.5")

        ax.set_xlabel("Recall")
        ax.set_ylabel("Precision")
        ax.set_title("Precision-Recall Curve")
        ax.legend(loc="lower left")
        fig.tight_layout()
        fig.savefig(OUT_DIR / "pr_curve.png", dpi=150)
        plt.close(fig)

    # Threshold analysis
    thresholds = np.linspace(0.0, 1.0, 101)
    precision_scores = []
    recall_scores = []
    f1_scores = []

    for t in thresholds:
        pred_t = [1 if p >= t else 0 for p in probs]
        precision_scores.append(precision_score(labels, pred_t, zero_division=0))
        recall_scores.append(recall_score(labels, pred_t, zero_division=0))
        f1_scores.append(f1_score(labels, pred_t, zero_division=0))

    best_idx = int(np.argmax(f1_scores))
    best_threshold = float(thresholds[best_idx])

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(thresholds, f1_scores, label="F1")
    ax.axvline(best_threshold, color="red", linestyle="--", label=f"Best={best_threshold:.2f}")
    ax.set_xlabel("Threshold")
    ax.set_ylabel("F1-score")
    ax.set_title("F1-score vs Threshold")
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUT_DIR / "f1_threshold.png", dpi=150)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(thresholds, precision_scores, label="Precision")
    ax.plot(thresholds, recall_scores, label="Recall")
    ax.axvline(best_threshold, color="red", linestyle="--", label=f"Best={best_threshold:.2f}")
    ax.set_xlabel("Threshold")
    ax.set_ylabel("Score")
    ax.set_title("Precision/Recall vs Threshold")
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUT_DIR / "precision_recall_threshold.png", dpi=150)
    plt.close(fig)

    # Probability distribution
    fig, ax = plt.subplots(figsize=(6, 4))
    probs_np = np.array(probs)
    labels_np = np.array(labels)
    ax.hist(probs_np[labels_np == 0], bins=20, alpha=0.6, label="Non-toxic", color="steelblue")
    ax.hist(probs_np[labels_np == 1], bins=20, alpha=0.6, label="Toxic", color="salmon")
    ax.set_xlabel("Predicted probability (class 1)")
    ax.set_ylabel("Count")
    ax.set_title("Probability Distribution")
    ax.legend()
    fig.tight_layout()
    fig.savefig(OUT_DIR / "probability_distribution.png", dpi=150)
    plt.close(fig)

    # Error analysis bar chart
    fig, ax = plt.subplots(figsize=(4, 4))
    ax.bar(["False Positive", "False Negative"], [len(fp_df), len(fn_df)], color=["orange", "purple"])
    ax.set_ylabel("Count")
    ax.set_title("Error Analysis")
    fig.tight_layout()
    fig.savefig(OUT_DIR / "error_analysis.png", dpi=150)
    plt.close(fig)

    # Calibration curve
    if has_both_classes:
        frac_pos, mean_pred = calibration_curve(labels, probs, n_bins=10, strategy="uniform")
        fig, ax = plt.subplots(figsize=(5, 5))
        ax.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Perfect")
        ax.plot(mean_pred, frac_pos, marker="o", label="Model")
        ax.set_xlabel("Mean Predicted Probability")
        ax.set_ylabel("Fraction of Positives")
        ax.set_title("Calibration Curve")
        ax.legend()
        fig.tight_layout()
        fig.savefig(OUT_DIR / "calibration_curve.png", dpi=150)
        plt.close(fig)

    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
