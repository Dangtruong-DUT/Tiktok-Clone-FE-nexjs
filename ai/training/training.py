import argparse
import json
import random
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModel, AutoTokenizer


BASE_DIR = Path(__file__).resolve().parents[1]


def clean_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "")
    text = text.replace("​", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class ToxicDataset(Dataset):
    def __init__(self, texts: list[str], labels: list[int]) -> None:
        self.texts = texts
        self.labels = labels

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, idx: int) -> tuple[str, int]:
        return self.texts[idx], self.labels[idx]


class PhoBERTClassifier(nn.Module):
    def __init__(self, model_name: str, num_labels: int = 2, dropout: float = 0.2) -> None:
        super().__init__()
        self.encoder = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(self.encoder.config.hidden_size, num_labels)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        # PhoBERT's first token embedding acts as sentence representation.
        pooled = outputs.last_hidden_state[:, 0, :]
        logits = self.classifier(self.dropout(pooled))
        return logits


@dataclass
class Metrics:
    loss: float
    accuracy: float
    precision: float
    recall: float
    f1: float


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    normalized = []
    for col in df.columns:
        col_name = col.replace("\ufeff", "").replace('"', "").strip().lower()
        normalized.append(col_name)
    df.columns = normalized

    sentence_col = next((c for c in df.columns if "sentence" in c), None)
    label_col = next((c for c in df.columns if "toxic" in c), None)

    if sentence_col is None or label_col is None:
        raise ValueError(f"Cannot find sentence/toxic columns in {df.columns.tolist()}")

    out = df[[sentence_col, label_col]].copy()
    out.columns = ["sentences", "toxic"]

    out["sentences"] = out["sentences"].astype(str).apply(clean_text)
    out["toxic"] = out["toxic"].astype(str).str.replace('"', "").str.strip()
    out = out[out["sentences"].str.len() > 0]
    out = out[out["toxic"].isin(["0", "1"])].copy()
    out["toxic"] = out["toxic"].astype(int)
    return out.reset_index(drop=True)


def read_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    if path.suffix.lower() == ".csv":
        df = pd.read_csv(path, encoding="utf-8-sig", engine="python", on_bad_lines="skip")
        return normalize_columns(df)

    if path.suffix.lower() == ".json":
        with path.open("r", encoding="utf-8") as f:
            raw = json.load(f)
        df = pd.DataFrame(raw)
        return normalize_columns(df)

    raise ValueError(f"Unsupported file format: {path.suffix}")


def create_collate_fn(tokenizer: AutoTokenizer, max_length: Optional[int]):
    def collate_fn(batch: list[tuple[str, int]]) -> dict[str, torch.Tensor]:
        texts, labels = zip(*batch)
        encoded = tokenizer(
            list(texts),
            padding=True,
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
        )
        encoded["labels"] = torch.tensor(labels, dtype=torch.long)
        return encoded

    return collate_fn


def build_model(model_name: str, num_labels: int) -> nn.Module:
    return PhoBERTClassifier(model_name=model_name, num_labels=num_labels)


def run_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    optimizer: Optional[AdamW] = None,
) -> Metrics:
    training = optimizer is not None
    model.train() if training else model.eval()

    all_preds: list[int] = []
    all_labels: list[int] = []
    total_loss = 0.0

    for batch in dataloader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        if training:
            optimizer.zero_grad(set_to_none=True)

        with torch.set_grad_enabled(training):
            logits = model(input_ids=input_ids, attention_mask=attention_mask)
            loss = criterion(logits, labels)

            if training:
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()

        total_loss += loss.item()
        preds = torch.argmax(logits, dim=1)
        all_preds.extend(preds.detach().cpu().numpy().tolist())
        all_labels.extend(labels.detach().cpu().numpy().tolist())

    avg_loss = total_loss / max(len(dataloader), 1)
    accuracy = accuracy_score(all_labels, all_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(
        all_labels,
        all_preds,
        average="binary",
        zero_division=0,
    )

    return Metrics(
        loss=avg_loss,
        accuracy=float(accuracy),
        precision=float(precision),
        recall=float(recall),
        f1=float(f1),
    )


def evaluate_on_test(
    model: nn.Module,
    test_loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Metrics:
    return run_epoch(
        model=model,
        dataloader=test_loader,
        criterion=criterion,
        device=device,
        optimizer=None,
    )


def print_metrics(prefix: str, metrics: Metrics) -> None:
    print(
        f"{prefix} | "
        f"loss: {metrics.loss:.4f} | "
        f"acc: {metrics.accuracy:.4f} | "
        f"precision: {metrics.precision:.4f} | "
        f"recall: {metrics.recall:.4f} | "
        f"f1: {metrics.f1:.4f}"
    )


def train_pipeline(args: argparse.Namespace) -> None:
    set_seed(args.seed)

    tokenizer = AutoTokenizer.from_pretrained(args.model_name, use_fast=False)
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")

    train_df = read_dataset(Path(args.train_path))
    valid_df = read_dataset(Path(args.valid_path))
    test_df = read_dataset(Path(args.test_path))

    train_dataset = ToxicDataset(
        texts=train_df["sentences"].tolist(),
        labels=train_df["toxic"].tolist(),
    )
    valid_dataset = ToxicDataset(
        texts=valid_df["sentences"].tolist(),
        labels=valid_df["toxic"].tolist(),
    )
    test_dataset = ToxicDataset(
        texts=test_df["sentences"].tolist(),
        labels=test_df["toxic"].tolist(),
    )

    collate_fn = create_collate_fn(tokenizer=tokenizer, max_length=args.max_length)

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        collate_fn=collate_fn,
    )
    valid_loader = DataLoader(
        valid_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        collate_fn=collate_fn,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        collate_fn=collate_fn,
    )

    model = build_model(model_name=args.model_name, num_labels=2).to(device)

    label_counts = train_df["toxic"].value_counts().sort_index()
    total = label_counts.sum()
    class_weights = torch.tensor(
        [total / (2 * label_counts[i]) for i in range(2)], dtype=torch.float
    ).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    print(f"Class weights: {class_weights.tolist()}")
    optimizer = AdamW(model.parameters(), lr=args.learning_rate)

    print(f"Using device: {device}")
    print("Architecture: phobert_classifier")

    best_f1 = -1.0
    output_path = Path(args.output_model_path)
    if not output_path.is_absolute():
        output_path = BASE_DIR / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        print(f"Epoch {epoch}/{args.epochs}")
        train_metrics = run_epoch(
            model=model,
            dataloader=train_loader,
            criterion=criterion,
            device=device,
            optimizer=optimizer,
        )
        val_metrics = run_epoch(
            model=model,
            dataloader=valid_loader,
            criterion=criterion,
            device=device,
            optimizer=None,
        )

        print_metrics(prefix="train", metrics=train_metrics)
        print_metrics(prefix="valid", metrics=val_metrics)

        if val_metrics.f1 > best_f1:
            best_f1 = val_metrics.f1
            torch.save(model.state_dict(), output_path)
            print(f"Saved best model to: {output_path}")

    print("Evaluating on test set using best checkpoint...")
    model.load_state_dict(torch.load(output_path, map_location=device, weights_only=True))
    test_metrics = evaluate_on_test(
        model=model,
        test_loader=test_loader,
        criterion=criterion,
        device=device,
    )
    print_metrics(prefix="test", metrics=test_metrics)



def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train Vietnamese toxic classifier with PhoBERT")
    parser.add_argument(
        "--model-name",
        type=str,
        default="vinai/phobert-base",
        help="HuggingFace model name",
    )
    parser.add_argument(
        "--train-path",
        type=str,
        default="data/processed/balanced/train.csv",
        help="Path to training dataset",
    )
    parser.add_argument(
        "--valid-path",
        type=str,
        default="data/processed/balanced/valid.csv",
        help="Path to validation dataset",
    )
    parser.add_argument(
        "--test-path",
        type=str,
        default="data/processed/balanced/test.csv",
        help="Path to test dataset",
    )
    parser.add_argument(
        "--output-model-path",
        type=str,
        default="models/best_phobert_model.pt",
        help="Where to save the best checkpoint",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size in [8, 32] recommended",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=4,
        help="Number of training epochs (3-5 recommended)",
    )
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=2e-5,
        help="AdamW learning rate",
    )
    parser.add_argument(
        "--max-length",
        type=int,
        default=256,
        help="Max tokenized sequence length",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()

    if args.batch_size < 8 or args.batch_size > 32:
        raise ValueError("batch_size should be between 8 and 32")
    if args.epochs < 3 or args.epochs > 5:
        raise ValueError("epochs should be between 3 and 5")

    return args


if __name__ == "__main__":
    train_pipeline(parse_args())
