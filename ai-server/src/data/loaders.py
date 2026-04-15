from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from datasets import Dataset

from src.data.preprocess import normalize_text, remove_diacritics


@dataclass
class DataBundle:
    train: pd.DataFrame
    valid: pd.DataFrame
    test: pd.DataFrame


def _resolve_path(path_str: str) -> Path:
    path = Path(path_str)
    if path.is_absolute():
        return path
    return Path.cwd() / path


def _read_csv(path: str) -> pd.DataFrame:
    target = _resolve_path(path)
    if not target.exists():
        raise FileNotFoundError(f"Dataset file not found: {target}")
    return pd.read_csv(target)


def _to_binary(value: object) -> int:
    try:
        return 1 if float(value) >= 0.5 else 0
    except (ValueError, TypeError):
        return 0


def _standardize_frame(raw_df: pd.DataFrame, source_cfg: Dict, label_space: List[str], lang: str) -> pd.DataFrame:
    text_col = source_cfg["text_column"]
    label_columns = source_cfg["label_columns"]

    if text_col not in raw_df.columns:
        raise KeyError(f"Missing text column '{text_col}'")

    data = pd.DataFrame()
    data["text"] = raw_df[text_col].fillna("").astype(str)
    data["lang"] = lang

    for label in label_space:
        mapped_col = label_columns.get(label)
        if mapped_col and mapped_col in raw_df.columns:
            data[label] = raw_df[mapped_col].map(_to_binary)
        else:
            data[label] = 0

    data = data.dropna(subset=["text"]).reset_index(drop=True)
    return data


def _load_from_source(source_cfg: Dict, label_space: List[str], lang: str) -> DataBundle:
    source_type = source_cfg.get("type", "csv")
    if source_type != "csv":
        raise ValueError("Only CSV source is supported in this implementation")

    train = _standardize_frame(_read_csv(source_cfg["train_path"]), source_cfg, label_space, lang)
    valid = _standardize_frame(_read_csv(source_cfg["valid_path"]), source_cfg, label_space, lang)
    test = _standardize_frame(_read_csv(source_cfg["test_path"]), source_cfg, label_space, lang)
    return DataBundle(train=train, valid=valid, test=test)


def _duplicate_vi_ascii(df: pd.DataFrame, preprocess_cfg: Dict) -> pd.DataFrame:
    if not preprocess_cfg.get("duplicate_vi_no_diacritic", False):
        return df

    ascii_df = df.copy()
    ascii_df["text"] = ascii_df["text"].map(remove_diacritics)

    if preprocess_cfg.get("keep_original_if_ascii", True):
        return pd.concat([df, ascii_df], ignore_index=True)

    return ascii_df


def _apply_preprocessing(df: pd.DataFrame, preprocess_cfg: Dict) -> pd.DataFrame:
    processed = df.copy()
    processed["text"] = processed["text"].map(lambda text: normalize_text(text, preprocess_cfg))
    processed = processed[processed["text"].str.len() > 0]
    return processed.reset_index(drop=True)


def _to_hf_dataset(df: pd.DataFrame, label_space: List[str]) -> Dataset:
    record_df = df.copy()
    record_df["labels"] = record_df[label_space].values.tolist()
    record_df = record_df[["text", "labels", "lang"]]
    return Dataset.from_pandas(record_df, preserve_index=False)


def _oversample(df: pd.DataFrame, target_len: int, random_state: int) -> pd.DataFrame:
    if len(df) >= target_len:
        return df
    sampled = df.sample(n=target_len, replace=True, random_state=random_state)
    return sampled.reset_index(drop=True)


def _build_mix_split(
    vi_df: pd.DataFrame,
    en_df: pd.DataFrame,
    vi_ratio: float,
    en_ratio: float,
    random_state: int,
) -> pd.DataFrame:
    if vi_ratio <= 0 or en_ratio <= 0:
        raise ValueError("vi_ratio and en_ratio must be positive")

    ratio_scale = vi_ratio / en_ratio
    target_en_len = int(len(vi_df) / ratio_scale)
    sampled_en = en_df.sample(
        n=min(len(en_df), max(target_en_len, 1)),
        random_state=random_state,
        replace=len(en_df) < max(target_en_len, 1),
    )
    mixed = pd.concat([vi_df, sampled_en], ignore_index=True)
    return mixed.sample(frac=1.0, random_state=random_state).reset_index(drop=True)


def load_stage_datasets(data_cfg: Dict, stage: str) -> Tuple[Dataset, Dataset, Dataset, List[str]]:
    label_space = data_cfg["label_space"]
    preprocess_cfg = data_cfg.get("preprocess", {})
    random_state = data_cfg.get("split", {}).get("random_state", 42)

    en_bundle = _load_from_source(data_cfg["english"]["source"], label_space, "en")
    vi_bundle = _load_from_source(data_cfg["vietnamese"]["source"], label_space, "vi")

    en_train = _apply_preprocessing(en_bundle.train, preprocess_cfg)
    en_valid = _apply_preprocessing(en_bundle.valid, preprocess_cfg)
    en_test = _apply_preprocessing(en_bundle.test, preprocess_cfg)

    vi_train = _apply_preprocessing(_duplicate_vi_ascii(vi_bundle.train, preprocess_cfg), preprocess_cfg)
    vi_valid = _apply_preprocessing(vi_bundle.valid, preprocess_cfg)
    vi_test = _apply_preprocessing(vi_bundle.test, preprocess_cfg)

    if stage == "en":
        train_df, valid_df, test_df = en_train, en_valid, en_test
    elif stage == "vi":
        train_df, valid_df, test_df = vi_train, vi_valid, vi_test
    elif stage == "mix":
        mix_cfg = data_cfg.get("mixing", {})
        vi_ratio = float(mix_cfg.get("vi_ratio", 0.7))
        en_ratio = float(mix_cfg.get("en_ratio", 0.3))

        if mix_cfg.get("oversample_vi", True):
            vi_train = _oversample(vi_train, max(len(vi_train), len(en_train)), random_state)

        train_df = _build_mix_split(vi_train, en_train, vi_ratio, en_ratio, random_state)
        valid_df = _build_mix_split(vi_valid, en_valid, vi_ratio, en_ratio, random_state)
        test_df = pd.concat([vi_test, en_test], ignore_index=True).sample(
            frac=1.0, random_state=random_state
        )
    else:
        raise ValueError(f"Unsupported stage: {stage}")

    train_ds = _to_hf_dataset(train_df, label_space)
    valid_ds = _to_hf_dataset(valid_df, label_space)
    test_ds = _to_hf_dataset(test_df, label_space)
    return train_ds, valid_ds, test_ds, label_space


def compute_pos_weight(train_ds: Dataset, clamp_min: float, clamp_max: float) -> np.ndarray:
    labels = np.array(train_ds["labels"], dtype=np.float32)
    positives = labels.sum(axis=0)
    negatives = len(labels) - positives
    with np.errstate(divide="ignore", invalid="ignore"):
        pos_weight = np.divide(negatives, np.maximum(positives, 1.0))
    pos_weight = np.clip(pos_weight, clamp_min, clamp_max)
    return pos_weight.astype(np.float32)


def split_eval_by_language(test_ds: Dataset) -> Dict[str, Dataset]:
    eval_map = {}
    for lang in ["vi", "en"]:
        subset = test_ds.filter(lambda item: item["lang"] == lang)
        if len(subset) > 0:
            eval_map[lang] = subset
    eval_map["all"] = test_ds
    return eval_map
