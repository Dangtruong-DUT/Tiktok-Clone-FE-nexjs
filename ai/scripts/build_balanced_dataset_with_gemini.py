#!/usr/bin/env python3
import argparse
import json
import os
import random
import re
import time
from collections import Counter
from pathlib import Path
from typing import List

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split
from tqdm import tqdm


try:
    import google.generativeai as genai
except ImportError:
    genai = None


SEED = 42
random.seed(SEED)
np.random.seed(SEED)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Visualize cleaned data, augment with Gemini, balance labels and text length, "
            "then split by ratio train/test/valid = 1/1/8."
        )
    )
    parser.add_argument(
        "--input-dir",
        type=str,
        default="data/processed/cleaned",
        help="Directory containing *.clean.csv files",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="data/processed/balanced",
        help="Directory for output csv, plots, and report",
    )
    parser.add_argument(
        "--gemini-model",
        type=str,
        default="models/gemini-2.0-flash",
        help="Gemini model name",
    )
    parser.add_argument(
        "--target-per-class",
        type=int,
        default=25000,
        help="Target sample count for each class after balancing",
    )
    parser.add_argument(
        "--target-length",
        type=int,
        default=64,
        help="Target sentence length (characters)",
    )
    parser.add_argument(
        "--length-tolerance",
        type=int,
        default=8,
        help="Accepted +/- tolerance from target length",
    )
    parser.add_argument(
        "--variants-per-call",
        type=int,
        default=8,
        help="How many rewritten variants to request from Gemini each API call",
    )
    parser.add_argument(
        "--max-api-calls",
        type=int,
        default=3000,
        help="Safety cap for total Gemini API calls",
    )
    parser.add_argument(
        "--api-sleep-seconds",
        type=float,
        default=0.2,
        help="Delay between Gemini calls to reduce rate-limit issues",
    )
    parser.add_argument(
        "--max-source-per-label",
        type=int,
        default=5000,
        help="Cap source pool per label for augmentation seed selection",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not call Gemini API; only visualize and split existing sampled data",
    )
    return parser.parse_args()


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    normalized = []
    for c in df.columns:
        c2 = c.replace("\ufeff", "").replace('"', "").strip().lower()
        normalized.append(c2)
    df.columns = normalized

    sentence_col = None
    label_col = None

    for c in df.columns:
        if sentence_col is None and "sentence" in c:
            sentence_col = c
        if label_col is None and "toxic" in c:
            label_col = c

    if sentence_col is None or label_col is None:
        raise ValueError(f"Cannot find sentence/toxic columns in {df.columns.tolist()}")

    df = df[[sentence_col, label_col]].copy()
    df.columns = ["sentences", "toxic"]

    df["sentences"] = (
        df["sentences"]
        .astype(str)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )
    df["toxic"] = df["toxic"].astype(str).str.replace('"', "").str.strip()
    df = df[df["sentences"].str.len() > 0]
    df = df[df["toxic"].isin(["0", "1"])].copy()
    df["toxic"] = df["toxic"].astype(int)
    return df


def load_cleaned_dataset(input_dir: Path) -> pd.DataFrame:
    frames = []
    files = sorted(input_dir.glob("*.csv"))
    if not files:
        raise FileNotFoundError(f"No csv files found in {input_dir}")

    for f in files:
        # engine='python' is slower but more tolerant to bad quoted/newline content.
        df = pd.read_csv(
            f,
            encoding="utf-8-sig",
            engine="python",
            on_bad_lines="skip",
        )
        df = normalize_columns(df)
        df["source_file"] = f.name
        frames.append(df)

    all_df = pd.concat(frames, ignore_index=True)
    all_df = all_df.drop_duplicates(subset=["sentences", "toxic"]).reset_index(drop=True)
    return all_df


def add_length_column(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["length"] = out["sentences"].str.len()
    return out


def save_visualizations(df: pd.DataFrame, output_dir: Path, prefix: str) -> None:
    sns.set_theme(style="whitegrid")
    output_dir.mkdir(parents=True, exist_ok=True)

    class_counts = df["toxic"].value_counts().sort_index()
    plt.figure(figsize=(8, 5))
    ax = sns.barplot(x=class_counts.index.astype(str), y=class_counts.values, palette="Set2")
    ax.set_title(f"Class Distribution ({prefix})")
    ax.set_xlabel("Label toxic")
    ax.set_ylabel("Count")
    for i, v in enumerate(class_counts.values):
        ax.text(i, v, str(v), ha="center", va="bottom", fontsize=9)
    plt.tight_layout()
    plt.savefig(output_dir / f"class_distribution_{prefix}.png", dpi=180)
    plt.close()

    plt.figure(figsize=(10, 5))
    sns.histplot(
        data=df,
        x="length",
        hue="toxic",
        bins=60,
        kde=True,
        palette="Set1",
        alpha=0.45,
    )
    plt.axvline(df["length"].median(), color="black", linestyle="--", linewidth=1)
    plt.title(f"Length Distribution ({prefix})")
    plt.xlabel("Sentence length (characters)")
    plt.tight_layout()
    plt.savefig(output_dir / f"length_distribution_{prefix}.png", dpi=180)
    plt.close()


def clean_text_simple(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text


def trim_to_length(text: str, max_length: int) -> str:
    if len(text) <= max_length:
        return text
    # Prefer trimming at punctuation near boundary to keep readability.
    cut = text[: max_length + 1]
    matches = [m.start() for m in re.finditer(r"[\.,;:!?]", cut)]
    if matches:
        idx = matches[-1]
        if idx > int(max_length * 0.6):
            return cut[: idx + 1].strip()
    return text[:max_length].strip()


def parse_json_array_from_text(raw: str) -> List[str]:
    raw = raw.strip()
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x).strip() for x in data if str(x).strip()]
    except json.JSONDecodeError:
        pass

    match = re.search(r"\[(.|\n|\r)*\]", raw)
    if match:
        chunk = match.group(0)
        try:
            data = json.loads(chunk)
            if isinstance(data, list):
                return [str(x).strip() for x in data if str(x).strip()]
        except json.JSONDecodeError:
            return []
    return []


def build_prompt(seed_text: str, label: int, n_variants: int, min_len: int, max_len: int) -> str:
    label_desc = "toxic/offensive" if label == 1 else "non-toxic/neutral"
    return (
        "Ban la tro ly tao du lieu NLP tieng Viet. "
        f"Hay viet lai cau dau vao thanh {n_variants} cau moi, giu nguyen nhan/chu de, "
        f"giu cung nhan {label_desc}. "
        f"Do dai moi cau trong khoang {min_len}-{max_len} ky tu. "
        "Khong danh so, khong giai thich, khong markdown. "
        "Tra ve DUY NHAT JSON array chuoi.\n"
        f"Cau goc: {seed_text}"
    )


def request_gemini_variants(
    model,
    seed_text: str,
    label: int,
    n_variants: int,
    min_len: int,
    max_len: int,
) -> List[str]:
    prompt = build_prompt(seed_text, label, n_variants, min_len, max_len)
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.9,
            "top_p": 0.95,
            "max_output_tokens": 512,
        },
    )
    text = ""
    if hasattr(response, "text") and response.text:
        text = response.text
    return parse_json_array_from_text(text)


def augment_to_target(
    df: pd.DataFrame,
    target_per_class: int,
    target_length: int,
    tolerance: int,
    model,
    dry_run: bool,
    variants_per_call: int,
    max_api_calls: int,
    api_sleep_seconds: float,
    max_source_per_label: int,
) -> pd.DataFrame:
    min_len = max(8, target_length - tolerance)
    max_len = target_length + tolerance
    soft_max = target_length + (2 * tolerance)

    out_parts = []
    api_calls = 0
    generated_total = 0
    api_error_count = 0
    last_api_error = ""

    for label in [0, 1]:
        label_df = df[df["toxic"] == label].copy()
        current = len(label_df)

        # Downsample using samples closest to target length.
        if current > target_per_class:
            tmp = label_df.copy()
            tmp["length_diff"] = (tmp["sentences"].str.len() - target_length).abs()
            label_df = (
                tmp.sort_values("length_diff", ascending=True)
                .head(target_per_class)
                .drop(columns=["length_diff"])
            )
            current = len(label_df)

        needed = target_per_class - current
        generated_rows = []

        if needed > 0 and not dry_run:
            source_pool = df[df["toxic"] == label]["sentences"].drop_duplicates().tolist()
            random.shuffle(source_pool)
            source_pool = source_pool[:max_source_per_label]

            pbar = tqdm(total=needed, desc=f"augment_label_{label}", unit="sample")
            seen = set(label_df["sentences"].tolist())

            while needed > 0 and api_calls < max_api_calls:
                if not source_pool:
                    break
                seed_text = random.choice(source_pool)
                api_calls += 1

                try:
                    variants = request_gemini_variants(
                        model=model,
                        seed_text=seed_text,
                        label=label,
                        n_variants=min(variants_per_call, needed),
                        min_len=min_len,
                        max_len=max_len,
                    )
                except Exception as exc:
                    api_error_count += 1
                    last_api_error = str(exc)
                    time.sleep(api_sleep_seconds)
                    continue

                accepted_this_call = 0
                for text in variants:
                    cleaned = clean_text_simple(text)
                    if not cleaned:
                        continue
                    if len(cleaned) < min_len or len(cleaned) > max_len:
                        continue
                    if cleaned in seen:
                        continue
                    seen.add(cleaned)
                    generated_rows.append({"sentences": cleaned, "toxic": label})
                    needed -= 1
                    accepted_this_call += 1
                    generated_total += 1
                    pbar.update(1)
                    if needed == 0:
                        break

                if accepted_this_call == 0:
                    # Guard against repeated low-quality output.
                    time.sleep(api_sleep_seconds)
                else:
                    time.sleep(api_sleep_seconds)

            pbar.close()

        elif needed > 0 and dry_run:
            # In dry-run mode, keep original class count and skip artificial duplication.
            pass

        if generated_rows:
            gen_df = pd.DataFrame(generated_rows)
            label_df = pd.concat([label_df, gen_df], ignore_index=True)

        # Fallback to upsampling when API cap/rate limit prevents reaching target.
        if len(label_df) < target_per_class:
            shortfall = target_per_class - len(label_df)
            if len(label_df) > 0:
                topup_df = label_df.sample(n=shortfall, replace=True, random_state=SEED)
                label_df = pd.concat([label_df, topup_df], ignore_index=True)

        # Keep exactly target_per_class, prioritizing closer-to-target length.
        if len(label_df) > target_per_class:
            tmp = label_df.copy()
            tmp["length_diff"] = (tmp["sentences"].str.len() - target_length).abs()
            label_df = (
                tmp.sort_values("length_diff", ascending=True)
                .head(target_per_class)
                .drop(columns=["length_diff"])
            )

        out_parts.append(label_df)

    out_df = pd.concat(out_parts, ignore_index=True)

    # Soft normalize very long samples toward target-length band.
    out_df["sentences"] = out_df["sentences"].astype(str).map(clean_text_simple).map(
        lambda s: trim_to_length(s, soft_max)
    )

    print(f"Total Gemini API calls: {api_calls}")
    print(f"Total generated samples accepted: {generated_total}")
    if api_error_count > 0:
        print(f"Total Gemini API errors: {api_error_count}")
        print(f"Last Gemini API error: {last_api_error}")

    return out_df


def split_8_1_1(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Split dataset 80% train / 10% valid / 10% test (stratified by label)."""
    train_df, rest_df = train_test_split(
        df,
        train_size=0.8,
        random_state=SEED,
        stratify=df["toxic"],
    )

    # rest is 20%. Split evenly into valid (10% total) and test (10% total).
    valid_df, test_df = train_test_split(
        rest_df,
        train_size=0.5,
        random_state=SEED,
        stratify=rest_df["toxic"],
    )

    return (
        train_df.sample(frac=1, random_state=SEED).reset_index(drop=True),
        valid_df.sample(frac=1, random_state=SEED).reset_index(drop=True),
        test_df.sample(frac=1, random_state=SEED).reset_index(drop=True),
    )


def summarize(df: pd.DataFrame) -> dict:
    lengths = df["sentences"].str.len()
    return {
        "total": int(len(df)),
        "class_counts": {str(k): int(v) for k, v in Counter(df["toxic"]).items()},
        "length": {
            "mean": float(lengths.mean()) if len(lengths) else 0.0,
            "median": float(lengths.median()) if len(lengths) else 0.0,
            "p25": float(lengths.quantile(0.25)) if len(lengths) else 0.0,
            "p75": float(lengths.quantile(0.75)) if len(lengths) else 0.0,
            "min": int(lengths.min()) if len(lengths) else 0,
            "max": int(lengths.max()) if len(lengths) else 0,
        },
    }


def init_gemini(model_name: str):
    if genai is None:
        raise ImportError(
            "google-generativeai is not installed. Install with: pip install google-generativeai"
        )

    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
    api_key = os.getenv("Gemini_Api_key", "").strip()
    if not api_key:
        raise RuntimeError("Missing Gemini_Api_key in ai/.env")

    genai.configure(api_key=api_key)
    resolved_model_name = model_name
    if not resolved_model_name.startswith("models/"):
        resolved_model_name = f"models/{resolved_model_name}"

    model = genai.GenerativeModel(model_name=resolved_model_name)
    return model


def main() -> None:
    args = parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading cleaned dataset...")
    df = load_cleaned_dataset(input_dir)
    df = add_length_column(df)

    print("Saving pre-processing visualizations...")
    save_visualizations(df, output_dir, prefix="before")

    model = None
    if not args.dry_run:
        print("Initializing Gemini model...")
        model = init_gemini(args.gemini_model)

    print("Balancing + augmenting dataset...")
    balanced_df = augment_to_target(
        df=df[["sentences", "toxic"]],
        target_per_class=args.target_per_class,
        target_length=args.target_length,
        tolerance=args.length_tolerance,
        model=model,
        dry_run=args.dry_run,
        variants_per_call=args.variants_per_call,
        max_api_calls=args.max_api_calls,
        api_sleep_seconds=args.api_sleep_seconds,
        max_source_per_label=args.max_source_per_label,
    )

    balanced_df = add_length_column(balanced_df)
    save_visualizations(balanced_df, output_dir, prefix="after")

    print("Splitting data with ratio train/test/valid = 1/1/8...")
    train_df, valid_df, test_df = split_8_1_1(balanced_df[["sentences", "toxic"]])

    train_df.to_csv(output_dir / "train.csv", index=False, encoding="utf-8-sig")
    test_df.to_csv(output_dir / "test.csv", index=False, encoding="utf-8-sig")
    valid_df.to_csv(output_dir / "valid.csv", index=False, encoding="utf-8-sig")

    report = {
        "before": summarize(df[["sentences", "toxic"]]),
        "after": summarize(balanced_df[["sentences", "toxic"]]),
        "split": {
            "train": summarize(train_df),
            "test": summarize(test_df),
            "valid": summarize(valid_df),
        },
        "params": {
            "target_per_class": args.target_per_class,
            "target_length": args.target_length,
            "length_tolerance": args.length_tolerance,
            "gemini_model": args.gemini_model,
            "dry_run": args.dry_run,
        },
    }

    with (output_dir / "report.json").open("w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("Done. Outputs:")
    print(f"- {output_dir / 'train.csv'}")
    print(f"- {output_dir / 'test.csv'}")
    print(f"- {output_dir / 'valid.csv'}")
    print(f"- {output_dir / 'class_distribution_before.png'}")
    print(f"- {output_dir / 'length_distribution_before.png'}")
    print(f"- {output_dir / 'class_distribution_after.png'}")
    print(f"- {output_dir / 'length_distribution_after.png'}")
    print(f"- {output_dir / 'report.json'}")


if __name__ == "__main__":
    main()
