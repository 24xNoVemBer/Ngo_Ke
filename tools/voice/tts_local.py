"""Load the V0-pinned VieNeu files from the local Hugging Face cache."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HF_HOME = ROOT / "tools" / "voice" / ".cache" / "huggingface"
MODEL_REPOSITORY = "pnnbao-ump/VieNeu-TTS-v3-Turbo"
MODEL_REVISION = "61b85e3d937fbbacb387714180e8182823512523"
CODEC_REPOSITORY = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX"
CODEC_REVISION = "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae"
MODEL_DIR = HF_HOME / "hub" / ("models--" + MODEL_REPOSITORY.replace("/", "--")) / "snapshots" / MODEL_REVISION
CODEC_DIR = HF_HOME / "hub" / ("models--" + CODEC_REPOSITORY.replace("/", "--")) / "snapshots" / CODEC_REVISION


def load_tts():
    os.environ["HF_HOME"] = str(HF_HOME)
    os.environ["HF_HUB_OFFLINE"] = "1"
    for directory, required in (
        (MODEL_DIR / "onnx_update", "vieneu_prefill.onnx"),
        (CODEC_DIR, "moss_audio_tokenizer_decode_full.onnx"),
    ):
        if not (directory / required).is_file():
            raise RuntimeError(f"Pinned local voice artifact missing: {directory / required}")

    from vieneu import Vieneu
    from vieneu._v3_turbo_engine.onnx_runtime_lite import OnnxV3LiteEngine

    # VieNeu 3.7.1 exposes a local ONNX path but not a local codec path; pass the
    # pinned codec into its engine constructor only while the engine is created.
    original_init = OnnxV3LiteEngine.__init__

    def init_with_pinned_codec(self, *args, **kwargs):
        kwargs["codec_dir"] = str(CODEC_DIR)
        original_init(self, *args, **kwargs)

    OnnxV3LiteEngine.__init__ = init_with_pinned_codec
    try:
        return Vieneu(
            backend="onnx",
            backbone_repo=str(MODEL_DIR),
            onnx_dir=str(MODEL_DIR / "onnx_update"),
        )
    finally:
        OnnxV3LiteEngine.__init__ = original_init
