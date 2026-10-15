# Android font-scale check — 14/10/2026

**Device:** `Medium_Phone_API_37.0`, Android API 37, 1080 × 2400.
**Build:** installed release APK `com.valentino241.ngokedemo`, SHA-256 `D6BB16DCE259002D38D112DACA28E9DD91BF5D0681C005AEC9BB83025E8AB50D`.

These are native app screenshots and UIAutomator trees. The AVD has no audio input/output, so they cover layout and controls only.

- At font scale 1.5, the Q&A screen kept the voice, typing and notebook controls available; all four prompt chips were reachable after scrolling. See `font-1_5.png` and `font-1_5-ui.xml`.
- At font scale 2.0, the selected answer showed its Ready player and kept answer text collapsed. After scrolling to the end, both follow-up chips were fully above the fixed voice dock. UIAutomator bounds were `[42,1175][959,1312]` and `[42,1323][808,1460]`; the scroll viewport ended at y=2024, where the dock begins. See `font-2_0-followups-full.png` and `font-2_0-followups-full-ui.xml`.
- Setting Android font scale while the app was open recreated the activity and returned navigation to the Prologue; the test navigated back through the app. This does not verify changing font scale while the app is backgrounded.

This check does not verify TalkBack, iPhone Dynamic Type/VoiceOver, audio, microphone, STT or performance.
