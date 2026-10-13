"""Pinned local Vietnamese ASR model used by probes, QA, and the gateway."""

WHISPER_MODEL = "Systran/faster-whisper-small"
WHISPER_REVISION = "536b0662742c02347bc0e980a01041f333bce120"


def load_model(cache_dir):
    from faster_whisper import WhisperModel

    return WhisperModel(
        WHISPER_MODEL,
        revision=WHISPER_REVISION,
        device="cpu",
        compute_type="int8",
        download_root=str(cache_dir),
    )
