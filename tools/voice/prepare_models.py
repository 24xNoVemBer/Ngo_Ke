"""Download the two exact V0-tested model snapshots into the local cache."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HF_HOME = ROOT / "tools" / "voice" / ".cache" / "huggingface"
os.environ.setdefault("HF_HOME", str(HF_HOME))

from huggingface_hub import snapshot_download

MODELS = {
    "pnnbao-ump/VieNeu-TTS-v3-Turbo": "61b85e3d937fbbacb387714180e8182823512523",
    "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX": "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae",
}


def main() -> None:
    for repository, revision in MODELS.items():
        snapshot = snapshot_download(
            repo_id=repository,
            revision=revision,
            cache_dir=str(HF_HOME / "hub"),
            repo_type="model",
        )
        ref = HF_HOME / "hub" / ("models--" + repository.replace("/", "--")) / "refs" / "main"
        ref.parent.mkdir(parents=True, exist_ok=True)
        ref.write_text(revision + "\n", encoding="utf-8")
        print(f"{repository}@{revision} -> {snapshot}")


if __name__ == "__main__":
    main()
