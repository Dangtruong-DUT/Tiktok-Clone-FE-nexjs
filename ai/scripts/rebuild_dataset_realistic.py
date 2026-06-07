#!/usr/bin/env python3
"""
Rebuild train/valid/test splits with a realistic distribution strategy:

  Train:  70% Non-toxic / 30% Toxic  (learns toxic well, closer to real ratio)
  Valid:  Real distribution from valid.clean.csv  (accurate val metrics)
  Test:   Real distribution from test.clean.csv   (accurate test metrics)

Respects the original train/valid/test source splits to avoid data leakage.
"""
import argparse
import re
import unicodedata
from pathlib import Path

import numpy as np
import pandas as pd


SEED = 42
BASE_DIR = Path(__file__).resolve().parents[1]
CLEANED_DIR = BASE_DIR / "data/processed/cleaned"
OUTPUT_DIR  = BASE_DIR / "data/processed/balanced"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--clean-ratio", type=float, default=0.70,
                   help="Fraction of Non-toxic in train (default 0.70 → 70/30)")
    p.add_argument("--seed", type=int, default=SEED)
    return p.parse_args()


def clean_text(text: str) -> str:
    text = unicodedata.normalize("NFC", str(text) if text else "")
    text = text.replace("​", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def load_clean_csv(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="utf-8-sig", engine="python", on_bad_lines="skip")
    # Normalise column names
    df.columns = [c.replace("﻿", "").replace('"', "").strip().lower() for c in df.columns]

    sentence_col = next((c for c in df.columns if "sentence" in c), None)
    label_col    = next((c for c in df.columns if "toxic" in c), None)
    if sentence_col is None or label_col is None:
        raise ValueError(f"Cannot find sentence/toxic columns in {path}: {df.columns.tolist()}")

    out = df[[sentence_col, label_col]].copy()
    out.columns = ["sentences", "toxic"]
    out["sentences"] = out["sentences"].astype(str).apply(clean_text)
    out["toxic"] = out["toxic"].astype(str).str.replace('"', "").str.strip()
    out = out[out["sentences"].str.len() > 0]
    out = out[out["toxic"].isin(["0", "1"])].copy()
    out["toxic"] = out["toxic"].astype(int)
    return out.reset_index(drop=True)


def print_stats(name: str, df: pd.DataFrame) -> None:
    vc = df["toxic"].value_counts().sort_index()
    total = len(df)
    c0 = int(vc.get(0, 0))
    c1 = int(vc.get(1, 0))
    print(f"  {name:6s}: total={total:6d}  clean={c0:6d} ({100*c0/total:.1f}%)  "
          f"toxic={c1:6d} ({100*c1/total:.1f}%)  "
          f"max_len={df['sentences'].str.len().max()}")


def main() -> None:
    args = parse_args()
    rng = np.random.default_rng(args.seed)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    train_src = CLEANED_DIR / "train.clean.csv"
    valid_src = CLEANED_DIR / "valid.clean.csv"
    test_src  = CLEANED_DIR / "test.clean.csv"

    for p in (train_src, valid_src, test_src):
        if not p.exists():
            raise FileNotFoundError(f"Cleaned file not found: {p}")

    print("Loading cleaned splits...")
    train_raw = load_clean_csv(train_src)
    valid_raw = load_clean_csv(valid_src)
    test_raw  = load_clean_csv(test_src)

    # ── TRAIN: 70% clean / 30% toxic ─────────────────────────────────────
    toxic_train  = train_raw[train_raw["toxic"] == 1].copy()
    clean_train  = train_raw[train_raw["toxic"] == 0].copy()

    n_toxic  = len(toxic_train)
    # clean_needed = n_toxic * (clean_ratio / toxic_ratio)
    toxic_ratio = 1.0 - args.clean_ratio
    n_clean_target = int(round(n_toxic * (args.clean_ratio / toxic_ratio)))

    if n_clean_target > len(clean_train):
        raise ValueError(
            f"Not enough clean samples: need {n_clean_target}, have {len(clean_train)}. "
            "Lower --clean-ratio or add more clean data."
        )

    clean_sampled = clean_train.sample(n=n_clean_target, random_state=args.seed)
    train_df = pd.concat([clean_sampled, toxic_train], ignore_index=True)
    train_df = train_df.sample(frac=1, random_state=args.seed).reset_index(drop=True)

    # ── VALID / TEST: keep real distribution (all samples) ───────────────
    valid_df = valid_raw.copy()
    test_df  = test_raw.copy()

    # ── Save ─────────────────────────────────────────────────────────────
    print("\nDataset statistics:")
    print_stats("train", train_df)
    print_stats("valid", valid_df)
    print_stats("test",  test_df)

    train_df.to_csv(OUTPUT_DIR / "train.csv", index=False, encoding="utf-8-sig")
    valid_df.to_csv(OUTPUT_DIR / "valid.csv", index=False, encoding="utf-8-sig")
    test_df.to_csv( OUTPUT_DIR / "test.csv",  index=False, encoding="utf-8-sig")

    print(f"\nSaved to {OUTPUT_DIR}/")
    print("  train.csv  valid.csv  test.csv")


if __name__ == "__main__":
    main()
