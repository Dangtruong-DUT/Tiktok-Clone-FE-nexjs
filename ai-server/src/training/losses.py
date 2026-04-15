from __future__ import annotations

import torch


def multilabel_bce_loss(logits: torch.Tensor, labels: torch.Tensor, pos_weight: torch.Tensor | None):
    labels = labels.float()
    return torch.nn.functional.binary_cross_entropy_with_logits(
        logits,
        labels,
        pos_weight=pos_weight,
    )
