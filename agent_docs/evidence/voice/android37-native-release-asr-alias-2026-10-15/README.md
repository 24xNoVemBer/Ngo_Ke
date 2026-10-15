# Android API 37 release after Q&A alias update — 15/10/2026

The Expo SDK 57 release APK was rebuilt after adding four exact aliases for measured large-v3 transcript variants. It is 121,249,288 bytes with SHA-256 `A44C99FF04125D5C24DD45ADFEA8C74EB8675C53EA00B4C2B45CEFEF95538BBC`. Installed package `com.valentino241.ngokedemo` on `emulator-5554` reports the same SHA-256 for `base.apk`.

On the native app, I opened Ngõ Phất Lộc → point 04, opened the text-entry drawer and submitted `Hai chong gian hoa giay trong san`. The app showed that transcript and the expected `qa-flowers` answer text: “Mẹ An trồng giàn hoa giấy từ một cành nhỏ bà Nhi cho…”. The bundled answer player showed “Sẵn sàng · 00:09”. This verifies the alias and answer selection in the rebuilt app. It is typed text, not a microphone transcript.

- [Launch](launch.png)
- [Home](home.png)
- [Alley selector](alley.png)
- [Point 04 selected](point04.png)
- [Chapter 4 reader](reader.png)
- [Question drawer](input.png)
- [Typed transcript](typed.png)
- [Answer selected](answer.png)
- [Answer text and source transcript](answer-text.png)

The AVD has no usable audio input or output. It does not verify microphone capture, STT from speech, metering or audible answer playback.

The source dataset revision is `5a82b1d4fa223b2170fd9fa2c761a01479b4e3e159a81a6de72f65566a8d2568`. Replaying the saved 21-question synthetic transcript sets through the current strict matcher gives 21/21 expected IDs for both small and large-v3, with zero wrong or unknown results. This reuses saved transcripts; it is not a new ASR run or proof of human-speech accuracy.

Verification passed: `npm test` 170/170, typecheck, lint, Expo dependency check, 34/34 catalogue validation and local synthetic gateway abort/retry/quota/invalid-format/duration/silence smoke. The manifest file SHA-256 is `e59696011be1501097b08f11091a903f8b9a88d30d2914fcc255d1c28db774ba`; no audio file was regenerated.

The iOS JavaScript export is `mobile/dist/ios/_expo/static/js/ios/index-0462bc7bf16834cfd89e7154fb994480.hbc`, SHA-256 `35D9DBA66BAC6ECD1D429DE99CC75019524740685C345943036B7D8AA0E07108`. A fresh LAN Expo Go manifest and bundle returned HTTP 200 and included the new revision and alias. The iPhone has not reloaded `exp://192.168.100.36:8081`; the user-reported two-turn success was on `:8089`. Human listening QC and current-bundle iPhone speech coverage remain open.
