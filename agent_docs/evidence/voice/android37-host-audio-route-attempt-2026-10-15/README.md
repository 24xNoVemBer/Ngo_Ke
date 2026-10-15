# Android API 37 host-audio route attempt — 15/10/2026

- Test build: current `com.valentino241.ngokedemo` API 37 release APK, dataset revision `8b318b4e9955e3b7affe72cb21ea08cf8123a616eeab2eb1420ab105c7b65e6b`.
- Restarted the AVD with audio enabled, enabled its host microphone (`adb emu avd hostmicon`), and started the native recorder. AppOps showed `RECORD_AUDIO (running)` while the recorder was active.
- Played only the locally generated 1.84-second synthetic Q&A sample `tools/voice/.cache/qa-gateway-e2e-20261015/qa-02.wav` through the host speakers at FFplay volume 50. The capture screenshot shows the recorder running but no metering level; the clip was canceled without upload. This is an inconclusive AVD/host audio-route attempt, not an STT or hardware pass/fail.
- Restored the AVD to `-no-audio`, disabled host microphone input, restored Android animation scales to `1`, and confirmed the emulator booted. No personal audio was captured or sent.
- Screenshot: [`recording-no-input-level.png`](recording-no-input-level.png). SHA-256: `F72223E533753F6729BE4184560C25F8BE2E4E58199543EA637853A7CF06D163`.
