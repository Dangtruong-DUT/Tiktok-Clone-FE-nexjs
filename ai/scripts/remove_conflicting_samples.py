#!/usr/bin/env python3
"""
Remove conflicting-label and empty samples from cleaned CSVs.

Conflicting labels: a sentence appears with both label=0 and label=1 in the same file.
Both instances are removed (conservative approach — noisy training signal).
Empty: sentences that are empty/whitespace after cleaning.
"""

import pandas as pd
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
CLEANED_DIR = BASE / "data/processed/cleaned"


def remove_conflicting(path: Path) -> tuple[int, int]:
    df = pd.read_csv(path, encoding="utf-8-sig", engine="python", on_bad_lines="skip")
    before = len(df)

    # Remove empty sentences
    df = df[df["sentences"].astype(str).str.strip().ne("")]

    # Find sentences that appear with both label=0 and label=1
    label_sets = df.groupby("sentences")["toxic"].apply(set)
    conflicting_texts = label_sets[label_sets.apply(lambda s: len(s) > 1)].index

    df = df[~df["sentences"].isin(conflicting_texts)]
    df = df.reset_index(drop=True)

    removed_conflicting = len(conflicting_texts)
    removed_empty = before - len(df) - removed_conflicting * 2  # rough estimate
    total_removed = before - len(df)

    df.to_csv(path, index=False, encoding="utf-8-sig")
    return total_removed, len(conflicting_texts)


def main() -> None:
    total_removed = 0
    total_conflicts = 0

    for csv_file in sorted(CLEANED_DIR.glob("*.clean.csv")):
        removed, n_conflicts = remove_conflicting(csv_file)
        total_removed += removed
        total_conflicts += n_conflicts
        print(f"{csv_file.name}: removed {removed} rows ({n_conflicts} conflicting sentence groups)")

    print(f"\nTotal rows removed : {total_removed}")
    print(f"Total conflict groups: {total_conflicts}")


if __name__ == "__main__":
    main()
