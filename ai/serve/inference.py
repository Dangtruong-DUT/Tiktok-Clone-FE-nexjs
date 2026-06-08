import os
import re
import unicodedata
import contextlib
import io
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import torch
import torch.nn as nn
from dotenv import load_dotenv
from transformers import AutoModel, AutoTokenizer
from transformers.utils import logging as transformers_logging

try:
    from vncorenlp import VnCoreNLP
except Exception:  # pragma: no cover
    VnCoreNLP = None


def _load_env() -> None:
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=False)


_load_env()


class PhoBERTClassifier(nn.Module):
    def __init__(
        self,
        model_name: str,
        num_labels: int = 2,
        dropout: float = 0.2,
        hf_token: Optional[str] = None,
    ) -> None:
        super().__init__()
        pretrained_kwargs: dict[str, Any] = {}
        if hf_token:
            pretrained_kwargs["token"] = hf_token

        suppress_hf_load_logs = os.getenv("AI_SUPPRESS_HF_LOAD_LOGS", "true").lower() == "true"
        if suppress_hf_load_logs:
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                self.encoder = AutoModel.from_pretrained(model_name, **pretrained_kwargs)
        else:
            self.encoder = AutoModel.from_pretrained(model_name, **pretrained_kwargs)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(self.encoder.config.hidden_size, num_labels)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled = outputs.last_hidden_state[:, 0, :]
        return self.classifier(self.dropout(pooled))


@dataclass
class InferenceConfig:
    model_name: str = "vinai/phobert-base"
    model_path: str = "models/best_phobert_model.pt"
    max_length: int = 256
    device: str = "auto"
    vncorenlp_jar_path: Optional[str] = None
    vncorenlp_max_heap_size: str = "-Xmx2g"
    strict_segment: bool = False


class TextPipeline:
    def __init__(
        self,
        vncorenlp_jar_path: Optional[str],
        vncorenlp_max_heap_size: str,
        strict_segment: bool,
    ) -> None:
        self.strict_segment = strict_segment
        self._segmenter = None

        if VnCoreNLP is None:
            if strict_segment:
                raise RuntimeError("vncorenlp package is required but not installed.")
            return

        if not vncorenlp_jar_path:
            if strict_segment:
                raise RuntimeError(
                    "VNCORENLP_JAR_PATH is required when strict_segment=True."
                )
            return

        jar_path = Path(vncorenlp_jar_path)
        if not jar_path.exists():
            if strict_segment:
                raise FileNotFoundError(f"VnCoreNLP jar not found: {jar_path}")
            return

        self._segmenter = VnCoreNLP(
            str(jar_path),
            annotators="wseg",
            max_heap_size=vncorenlp_max_heap_size,
        )

    @staticmethod
    def clean_text(sentence: str) -> str:
        text = unicodedata.normalize("NFC", sentence or "")
        text = text.replace("\u200b", " ")
        text = re.sub(r"https?://\S+|www\.\S+", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def segment(self, cleaned_text: str) -> str:
        # We bypass VnCoreNLP segmentation here because the model was trained
        # on unsegmented text directly utilizing AutoTokenizer.
        # Passing segmented text to the tokenizer at inference drops the accuracy drastically.
        return cleaned_text


class ToxicInferenceService:
    def __init__(self, config: InferenceConfig) -> None:
        self.config = config

        if config.device == "auto":
            if torch.cuda.is_available():
                self.device = torch.device("cuda")
            elif torch.backends.mps.is_available():
                self.device = torch.device("mps")
            else:
                self.device = torch.device("cpu")
        else:
            self.device = torch.device(config.device)

        model_path = Path(config.model_path)
        if not model_path.is_absolute():
            base_dir = Path(__file__).resolve().parents[1]
            model_path = base_dir / model_path

        if not model_path.exists():
            raise FileNotFoundError(f"Model checkpoint not found: {model_path}")

        self.text_pipeline = TextPipeline(
            vncorenlp_jar_path=config.vncorenlp_jar_path,
            vncorenlp_max_heap_size=config.vncorenlp_max_heap_size,
            strict_segment=config.strict_segment,
        )

        if os.getenv("HF_HUB_DISABLE_PROGRESS_BARS") is None:
            os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"

        if os.getenv("HF_HUB_DISABLE_PROGRESS_BARS", "1") == "1":
            transformers_logging.disable_progress_bar()

        hf_token = os.getenv("HF_TOKEN")
        pretrained_kwargs: dict[str, Any] = {}
        if hf_token:
            pretrained_kwargs["token"] = hf_token

        self.tokenizer = AutoTokenizer.from_pretrained(
            config.model_name,
            use_fast=False,
            **pretrained_kwargs,
        )
        self.model = PhoBERTClassifier(model_name=config.model_name, hf_token=hf_token).to(self.device)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=True))
        self.model.eval()

    @torch.inference_mode()
    def predict(self, sentence: str) -> dict[str, Any]:
        cleaned_text = self.text_pipeline.clean_text(sentence)
        segmented_text = self.text_pipeline.segment(cleaned_text)

        encoded = self.tokenizer(
            segmented_text,
            padding=False,
            truncation=True,
            max_length=self.config.max_length,
            return_tensors="pt",
        )
        input_ids = encoded["input_ids"].to(self.device)
        attention_mask = encoded["attention_mask"].to(self.device)

        logits = self.model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(logits, dim=-1)[0]
        label = int(torch.argmax(probs).item())
        confidence = float(probs[label].item())

        return {
            "sentence": sentence,
            "label": label,
            "confidence": confidence,
        }


def build_default_service(strict_segment: Optional[bool] = None) -> ToxicInferenceService:
    if strict_segment is None:
        strict_segment = os.getenv("AI_STRICT_SEGMENT", "false").lower() == "true"

    config = InferenceConfig(
        model_name=os.getenv("AI_MODEL_NAME", "vinai/phobert-base"),
        model_path=os.getenv("AI_MODEL_PATH", "models/best_phobert_model.pt"),
        max_length=int(os.getenv("AI_MAX_LENGTH", "256")),
        device=os.getenv("AI_DEVICE", "auto"),
        vncorenlp_jar_path=os.getenv("VNCORENLP_JAR_PATH"),
        vncorenlp_max_heap_size=os.getenv("VNCORENLP_MAX_HEAP_SIZE", "-Xmx2g"),
        strict_segment=strict_segment,
    )
    return ToxicInferenceService(config=config)


_DEFAULT_SERVICE: Optional[ToxicInferenceService] = None


def predict(sentence: str) -> dict[str, Any]:
    global _DEFAULT_SERVICE
    if _DEFAULT_SERVICE is None:
        _DEFAULT_SERVICE = build_default_service()
    return _DEFAULT_SERVICE.predict(sentence)
