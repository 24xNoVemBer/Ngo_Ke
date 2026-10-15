"""Pinned local Vietnamese ASR model used by probes, QA, and the gateway."""

WHISPER_MODEL = "Systran/faster-whisper-small"
WHISPER_REVISION = "536b0662742c02347bc0e980a01041f333bce120"
LARGE_V3_MODEL = "Systran/faster-whisper-large-v3"
LARGE_V3_REVISION = "edaa852ec7e145841d8ffdb056a99866b5f0a478"


def load_model(cache_dir, model=WHISPER_MODEL, revision=WHISPER_REVISION, device="cpu", compute_type="int8"):
    from faster_whisper import WhisperModel

    return WhisperModel(
        model,
        revision=revision,
        device=device,
        compute_type=compute_type,
        download_root=str(cache_dir),
    )
