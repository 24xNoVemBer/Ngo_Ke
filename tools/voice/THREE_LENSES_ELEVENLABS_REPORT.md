# Three Lenses ElevenLabs generation and audit report

Generated 2026-10-19. Status: **provisional, source-only, not human-approved** (`humanApproved=false`, `selectedForShipping=false`). No API key is stored in this report or manifest.

## Frozen generation settings

- Scope: `old-quarter-three-lenses`; 56 tracks (28 English, 28 Vietnamese).
- Model: `eleven_v4`; output: `mp3_44100_128`; settings: `{"stability":0.5,"similarity_boost":0.75}`; voice rate: 1.0.
- Vietnamese: Th?m (`0ggMuQ1r9f9jqBu50nJn`). English: Talia (`OZ0L6eISlOejga3XjDFt`).
- Source: frozen Three Lenses content; raw source inventory totals 24,768 characters (EN 12,257; VI 12,511). Conservative project cap: 30,000 credits.
- Dataset revisions:
- `en`: `8c996ce9c61225bc442b603c700238d2dc169666742d37152fafb637eb0e8120`
- `vi`: `32e1553d86fa0ab109c75a161ce90a39c61a244fe441f5eab0d4f298f7b9197d`

## Billing evidence

- Initial subscription character count: 0.
- Two-caption checkpoint: reserved 140; charged 56; exact account delta 56; verified `true`.
- `en/oldquarter-bach-ma-caption`: reserved 65, charged 26; account snapshot 26 (delta 26); accepted_discount preserved from `cost_mismatch`.
- `vi/oldquarter-bach-ma-caption`: reserved 75, charged 30; account snapshot 56 (delta 56); accepted_discount preserved from `cost_mismatch`.
- Total observed project cost: **9909 credits**, within the 30,000-credit cap.
- Closing account snapshot (2026-10-19T06:06:39.483842+00:00): count 9909, limit 40000, remaining 30091; plan `starter`, overage/extension disabled.
- No paid request was retried. One saved paid response, ``en/oldquarter-ma-may-transition-story` (cost 147, request `CaCKMCcTQCZfmM2nR6I1`)`, was preserved, revalidated by source/hash/MP3 decode, and account-reconciled with its original `invalid` state retained in `costDecision.priorStatus`.

## Asset and catalogue audit

- Offline audit passed for 56/56 MP3s: full decode, MP3/44.1 kHz/128 kbps format, duration, SHA-256, source text/data hashes, locale/node mapping, and static catalogue match.
- 157 pre-existing audio asset hashes are persisted in the manifest (set fingerprint `14e629568f1d89bcb016280ebfa034c47ff20ba05ad0216f718ff839bfe3b317`) and matched in this worktree. Audit compares those recorded keys while allowing additional candidate-only assets.
- The audit reads no key, ignored ledger, or cache; it depends on the committed manifest, source inventory, static catalogue, and audio files.
- Source-only assets live under `mobile/assets/voice/three-lenses-elevenlabs/`; static requires are in `mobile/src/voice/threeLensesCatalog.ts`. Existing voice assets were preserved.

## Verification

- `python -m unittest tools.voice.test_elevenlabs_three_lenses`: **17 passed**.
- `python tools/voice/elevenlabs_three_lenses.py audit`: **56/56 passed** offline.
- `node --test tests/threeLensesVoiceCatalogue.test.mjs`: **1 passed**.
- `npm run typecheck`: **passed**.
- `git diff --check`: **passed**.
- Human listening/pronunciation review remains pending; this report does not approve shipping or redistribution.

## Per-track audit

`sourceDataSha256`, `sourceTextSha256`, and `spokenTextSha256` are recorded for each row in the machine-readable manifest. Account is shown as `characterCount/accountDeltaFromBaseline` from that track's reconciled cost decision.

| Locale | Track | Kind | Node | Chars | Credits | Cost decision | Account count/delta | Request ID | Seconds | Audio SHA-256 |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | ---: | --- |
| en | `bm-deity-answer` | answer | `oldquarter-bach-ma` | 109 | 44 | accepted_discount (cost_mismatch) | 4489/4489 | `DNhMrP67OqyHjPTtwQBD` | 6.64 | `2ee163efb9f534f961b44e3900d4941a9c3d6a3ac2dabec351aeecb071b8f6ae` |
| en | `bm-east-answer` | answer | `oldquarter-bach-ma` | 124 | 50 | accepted_discount (cost_mismatch) | 4489/4489 | `9NR8Rp4Nd1HvDO4XqNSG` | 6.96 | `f3c60d948a513121e81b70f5cf0ed78f4d509056b9207934c43fc3f248653bbd` |
| en | `bm-name-answer` | answer | `oldquarter-bach-ma` | 185 | 74 | accepted_discount (cost_mismatch) | 4489/4489 | `IeK6ZE4JVBznR4ZDRthj` | 10.88 | `a5a8682ef5fbfaa4d81b7d95b2e632f231be4ef4c34eaf7e6abd905061350500` |
| en | `dx-banner-answer` | answer | `oldquarter-dong-xuan` | 179 | 72 | accepted_discount (cost_mismatch) | 4883/4883 | `JYESHVtU3HuVM1HC4nvP` | 12.64 | `06e46cede624e48df6a7f4313c98298c2dbc8e39f3f07e2aacb67d6c709670db` |
| en | `dx-facade-answer` | answer | `oldquarter-dong-xuan` | 118 | 47 | accepted_discount (cost_mismatch) | 4883/4883 | `lWid6gOcgNgwGNl5o77O` | 7.52 | `63eb0da2c9da179b5f0f25cdad653f20817cb393a3f7d09c152f45fe150502d0` |
| en | `dx-fire-answer` | answer | `oldquarter-dong-xuan` | 78 | 31 | accepted_discount (cost_mismatch) | 4883/4883 | `AzKCKWWIHlpPyIuKLGts` | 5.52 | `4cb26cb246917adf0f876cf456ba6d26dc22684915c534dc1e6921d6e04842df` |
| en | `dx-fountain-answer` | answer | `oldquarter-dong-xuan` | 129 | 52 | accepted_discount (cost_mismatch) | 4883/4883 | `ajlst5CvFwEiucxUrM65` | 8.00 | `b06f4ee7eb69c2b1c6b4a6ba2028ebc795c8d60b331f75849adc1d4d76b7f5b9` |
| en | `dx-goods-answer` | answer | `oldquarter-dong-xuan` | 96 | 38 | accepted_discount (cost_mismatch) | 4883/4883 | `xxorvjgMR8vyDxLD2Ckq` | 6.24 | `58a52169afd32c43ecaa20e5936edf6558a5d2d2ca3999afb06330821dd35470` |
| en | `dx-history-answer` | answer | `oldquarter-dong-xuan` | 154 | 62 | accepted_discount (cost_mismatch) | 4883/4883 | `ZBQGxpvw5QAm0COAxUMW` | 9.12 | `29906091420da0cc5e854edb33e5a60ce47b2ea2667733b4907a94337587aacc` |
| en | `dx-rebuild-answer` | answer | `oldquarter-dong-xuan` | 64 | 26 | accepted_discount (cost_mismatch) | 4883/4883 | `2nkoIslAR91nNSoRIL6u` | 4.96 | `9b5edb6a6d6fc6d244e6baf1d5d86c0dccf9321bf2d84e6cd5099fa4c8c138f1` |
| en | `dx-stalls-answer` | answer | `oldquarter-dong-xuan` | 130 | 52 | accepted_discount (cost_mismatch) | 8454/8454 | `SehbpsnpQ834rQDlV3BA` | 8.40 | `b6002049b05e52ce323b12bd02c07c8f90761035b5a3990a257ae70475e7e9cb` |
| en | `dx-trade-answer` | answer | `oldquarter-dong-xuan` | 164 | 66 | accepted_discount (cost_mismatch) | 4883/4883 | `pyjPNRKQAs7wO9l7Q7kC` | 8.16 | `0c5554713016a996b1b2a630f839992d40048f15451b35dc95763fb1cf9326f3` |
| en | `intro` | intro | `?` | 981 | 392 | accepted_discount (cost_mismatch) | 448/448 | `qDkuzEXpCLqGEBvJ7KDb` | 63.28 | `9bdd662013b70b4f30804e53a73bc80bf91c6b4930826add23d1904780681dc0` |
| en | `mm-date-answer` | answer | `oldquarter-ma-may` | 114 | 46 | accepted_discount (cost_mismatch) | 4489/4489 | `7jumvJ4iAMfw3RZPxWIa` | 7.12 | `790a349eee4fbef2383aa45442250f01de14c75fd03d7feb04496c503fe83a97` |
| en | `mm-layout-answer` | answer | `oldquarter-ma-may` | 168 | 67 | accepted_discount (cost_mismatch) | 4489/4489 | `Xm2BgRWKoFmbHu5Cqzmx` | 9.84 | `e0088672cfea740e208b9f638058d0200f68888e458cfbdf931da844afd6785a` |
| en | `mm-restore-answer` | answer | `oldquarter-ma-may` | 82 | 33 | accepted_discount (cost_mismatch) | 4489/4489 | `X7auWM89f8p9JZH2S6KN` | 5.44 | `f9a835197fa7fe3a6e00d777b3dea516e34206c33acf3d401d5c78c4e22a10c9` |
| en | `mm-trade-answer` | answer | `oldquarter-ma-may` | 168 | 67 | accepted_discount (cost_mismatch) | 4489/4489 | `QL9qOXHJqXwJjI19Cr8j` | 10.48 | `7a560712df7a1afaec281f34ac95a7680a037b148b5414033f5354d587c32168` |
| en | `oldquarter-bach-ma-caption` | caption | `oldquarter-bach-ma` | 65 | 26 | accepted_discount (cost_mismatch) | 26/26 | `j3U5awKqp7t0WiyadRKo` | 4.96 | `c3bfa290d33c92fa8bd52d6c6798e9dcdec25556fdba3003c3d5016c6ffaa9d1` |
| en | `oldquarter-bach-ma-story` | story | `oldquarter-bach-ma` | 1537 | 615 | accepted_discount (cost_mismatch) | 1719/1719 | `JEitIjgH0n0aj14H4Prv` | 94.72 | `ba36dc67a9c8902cdd6fc1a22d705b1ca8da20f7c60197a5e6fc3d1ed7dd2967` |
| en | `oldquarter-bach-ma-transition-story` | story | `oldquarter-bach-ma` | 347 | 139 | accepted_discount (cost_mismatch) | 3776/3776 | `gRmBVcqdXDEdygyoktx1` | 23.20 | `1aab032fcc1379650d082a97e40fe8f1fce77f0a94502c972d98732a73cd5b31` |
| en | `oldquarter-dong-xuan-caption` | caption | `oldquarter-dong-xuan` | 75 | 30 | accepted_discount (cost_mismatch) | 3776/3776 | `xCVLV8q7cDew2fNwAzWQ` | 5.92 | `3f32ac99b6a120cb078d227f67195284ba07529cb668befbf69855ffd73ee5a3` |
| en | `oldquarter-dong-xuan-closing-story` | story | `oldquarter-dong-xuan` | 830 | 332 | accepted_discount (cost_mismatch) | 4489/4489 | `V3bga5jmcqTVS5rj2HEI` | 52.88 | `f82899bb70ebd7b843f29c16cea1e7fb27617290ff4e0128deb7f0a918537631` |
| en | `oldquarter-dong-xuan-fire-story` | story | `oldquarter-dong-xuan` | 1445 | 578 | accepted_discount (cost_mismatch) | 3431/3431 | `mzngvdxXJ6XIrsAIijIm` | 89.20 | `75f2f77a6ff56ebfd21e5d01b069775b4e8894cf6a69ed6902ace6a56e2dcc40` |
| en | `oldquarter-dong-xuan-story` | story | `oldquarter-dong-xuan` | 1374 | 550 | accepted_discount (cost_mismatch) | 2269/2269 | `RMARbZfYD0uk5DXj38rU` | 95.52 | `0e43e1d1a80730545aec300421d59ac8d6375b7b9a84943b3a33b8e2145dd18f` |
| en | `oldquarter-dong-xuan-street-story` | story | `oldquarter-dong-xuan` | 1461 | 584 | accepted_discount (cost_mismatch) | 3431/3431 | `gBvU94zDlJziBWF9eiEO` | 88.00 | `57bbdbc2055bc86be2578635157a4c1d738123a6bc735d0990ac92abcdb4809b` |
| en | `oldquarter-ma-may-caption` | caption | `oldquarter-ma-may` | 72 | 29 | accepted_discount (cost_mismatch) | 3460/3460 | `sykwTekyaI3G0wjCTT81` | 5.76 | `a176707696592800701d4233e6c8d0e08559f252043718e88af4aa006524131e` |
| en | `oldquarter-ma-may-story` | story | `oldquarter-ma-may` | 1641 | 656 | accepted_discount (cost_mismatch) | 1719/1719 | `JKYXnuuhvApjJPdDuUTM` | 103.92 | `335de5571f27cdf4fd752c0b687bba409369ba01bb33120d6cde1b9d9f40ea5f` |
| en | `oldquarter-ma-may-transition-story` | story | `oldquarter-ma-may` | 367 | 147 | accepted_discount (invalid) | 3776/3776 | `CaCKMCcTQCZfmM2nR6I1` | 24.24 | `3920ec8e7c16aa30523208f4990ed3b4ebac9edd796e4a3102181b07c899c7f9` |
| vi | `bm-deity-answer` | answer | `oldquarter-bach-ma` | 84 | 34 | accepted_discount (cost_mismatch) | 9341/9341 | `yvL4NXExso0nUgX5HdyR` | 5.36 | `adfe6cf3ebedb45b359a6c3cfb6899c21b1a54629e0e0d8184029e9562cf3e42` |
| vi | `bm-east-answer` | answer | `oldquarter-bach-ma` | 106 | 42 | accepted_discount (cost_mismatch) | 9341/9341 | `Tx1KArhH5i4qynGG4la1` | 6.08 | `ffecb53c6235ffb97468d3345314c437116fca59cd3f6cdaedd70a0a85be1ed4` |
| vi | `bm-name-answer` | answer | `oldquarter-bach-ma` | 202 | 81 | accepted_discount (cost_mismatch) | 9341/9341 | `eDy6WLjwNiysxKXT8YJ7` | 12.08 | `3bfcf7df4a1561c2795644f2004113afad7b6b2f8fd923aba5c2b4075c6a769a` |
| vi | `dx-banner-answer` | answer | `oldquarter-dong-xuan` | 148 | 59 | accepted_discount (cost_mismatch) | 9711/9711 | `9qzj7jOf19S2BPstALEl` | 13.76 | `b93a5a3224309cb8138d2f717e6ce21c406b5698d65a059c9c43b76830d2ab41` |
| vi | `dx-facade-answer` | answer | `oldquarter-dong-xuan` | 109 | 44 | accepted_discount (cost_mismatch) | 9711/9711 | `cxNcFelAfSS8QP9q7fKw` | 7.12 | `e1a18f53c6989b5ad0cc861f09232f9908eef2d2002a60f3e67d3f233b7cfacd` |
| vi | `dx-fire-answer` | answer | `oldquarter-dong-xuan` | 81 | 32 | accepted_discount (cost_mismatch) | 9711/9711 | `GWG3ujEWP9CA06JuGCyp` | 6.96 | `43e46ab2fd7af03523eca7f02d3f4d93256db4730e18e84b4c55ab0b21101edb` |
| vi | `dx-fountain-answer` | answer | `oldquarter-dong-xuan` | 130 | 52 | accepted_discount (cost_mismatch) | 9909/9909 | `yyqByFN4uVCfd9bqWJ8q` | 8.00 | `3e16e3b13b2d40178737dd5dc37d3d1aa19dbc9c39d666b4e2c30c583a486b8d` |
| vi | `dx-goods-answer` | answer | `oldquarter-dong-xuan` | 101 | 40 | accepted_discount (cost_mismatch) | 9909/9909 | `BkVHyy1JZVcOzRgF7OyJ` | 6.64 | `b4ac25887b4caa99b5b8c9a2c260899ded0857a51c291562132b7184157fb746` |
| vi | `dx-history-answer` | answer | `oldquarter-dong-xuan` | 192 | 77 | accepted_discount (cost_mismatch) | 9711/9711 | `E6evECasLtgXijcoJbr9` | 13.44 | `f569506995a8f1e156505cbbaa8c1b87e756b9c222663af898127df9f176fd20` |
| vi | `dx-rebuild-answer` | answer | `oldquarter-dong-xuan` | 61 | 24 | accepted_discount (cost_mismatch) | 9711/9711 | `FdKvBoMYU3EzIo2iydVO` | 5.36 | `eeb2e9735675c8bc43fa788891e4e7d2bf8d2bf3af6a45e95077afa1114d8241` |
| vi | `dx-stalls-answer` | answer | `oldquarter-dong-xuan` | 129 | 52 | accepted_discount (cost_mismatch) | 9909/9909 | `F4pFxuISgiPbvUVgVOSj` | 7.76 | `60a0ecdd26ad2aff552bb38bc336d6c7b4d08fddc0ad889cb6c02d1b9fb29963` |
| vi | `dx-trade-answer` | answer | `oldquarter-dong-xuan` | 135 | 54 | accepted_discount (cost_mismatch) | 9909/9909 | `sdtaRrnL9FKnCHy5vYjJ` | 7.92 | `5f78da388dc5991470c2014c7d6dca5d63476a5f46894b8fe72df9fd5b55dbbe` |
| vi | `intro` | intro | `?` | 954 | 382 | accepted_discount (cost_mismatch) | 8454/8454 | `saKgkAYjHLktcz32D6jE` | 67.28 | `f07120ffaaa2a37cea5a5444438bdb59f0d7e6e2a4e5688931e2699976555d19` |
| vi | `mm-date-answer` | answer | `oldquarter-ma-may` | 119 | 48 | accepted_discount (cost_mismatch) | 9711/9711 | `S4urE7dLonv4fV5fx5Zb` | 7.44 | `0043d25b4dbe8e8d9bd69dbbbcfdae495828e6940a166934a01012b4f97a298b` |
| vi | `mm-layout-answer` | answer | `oldquarter-ma-may` | 168 | 67 | accepted_discount (cost_mismatch) | 9341/9341 | `82Z7MdkkBa3jmtyNmks8` | 10.64 | `f0e498e11f08cf5b7a9021e21c8529aa84a255c7d351099b50f29bf6825db51b` |
| vi | `mm-restore-answer` | answer | `oldquarter-ma-may` | 88 | 35 | accepted_discount (cost_mismatch) | 9711/9711 | `8zYO3Eak81A96ErHU9y0` | 6.72 | `e901b78b510c6198dff8d38f7bcec8acd0b95a813d63d78950f3739b7df07501` |
| vi | `mm-trade-answer` | answer | `oldquarter-ma-may` | 128 | 51 | accepted_discount (cost_mismatch) | 9711/9711 | `pXkkJwO5G5jfFhXOtIEb` | 10.32 | `0563bef648b4eef9dd4cbfe4dce1c2ec066ef94ccf1263b9e38d27e4b297b5e7` |
| vi | `oldquarter-bach-ma-caption` | caption | `oldquarter-bach-ma` | 75 | 30 | accepted_discount (cost_mismatch) | 56/56 | `rKO4E4blpmmdqmJ1BoP2` | 5.52 | `32f177c6864e749dc635a2d255732fa8b1be4aaf8accf5c6f54b3f872fd239e2` |
| vi | `oldquarter-bach-ma-story` | story | `oldquarter-bach-ma` | 1570 | 628 | accepted_discount (cost_mismatch) | 8454/8454 | `rEeoHQqjcQm0p4ZJHYEo` | 106.00 | `5179e19b8ea3e5e8cb7f00ef2101533c72a6a98e959368e022200d47d28140ea` |
| vi | `oldquarter-bach-ma-transition-story` | story | `oldquarter-bach-ma` | 368 | 147 | accepted_discount (cost_mismatch) | 9341/9341 | `93HEHSvOi285Ws22GcJZ` | 26.32 | `cf7afde69cce18eb14726043ad7f3fd5114a3ed32f8200a074fcdeb31e1e0a0c` |
| vi | `oldquarter-dong-xuan-caption` | caption | `oldquarter-dong-xuan` | 79 | 32 | accepted_discount (cost_mismatch) | 9341/9341 | `rxaPOAZxF5opQFNOBM14` | 5.76 | `963cbcd1ad4a7d53985ec799b79839c91d9f1fe02a52bd5f42b6a3520d089e75` |
| vi | `oldquarter-dong-xuan-closing-story` | story | `oldquarter-dong-xuan` | 845 | 338 | accepted_discount (cost_mismatch) | 9341/9341 | `x6l9XYKSkSnGS2Wro3nE` | 58.56 | `98f79c837e89663703d50fe4a36177d4403a2afa3772d14e079099a36f175503` |
| vi | `oldquarter-dong-xuan-fire-story` | story | `oldquarter-dong-xuan` | 1490 | 596 | accepted_discount (cost_mismatch) | 8454/8454 | `2B1Nct2wXJ8qqo6yyMiq` | 106.08 | `d53d30568a821f197b46fb5b94d72aedce05e696804a7c40c1155e679f7abaf9` |
| vi | `oldquarter-dong-xuan-story` | story | `oldquarter-dong-xuan` | 1383 | 553 | accepted_discount (cost_mismatch) | 8454/8454 | `9HCrkADQx0DUF3VKVzpm` | 107.84 | `32a32ad0247402aa7b92bbf96fc072eca371530e8cdd9a2cdf9c659c1c73e0c7` |
| vi | `oldquarter-dong-xuan-street-story` | story | `oldquarter-dong-xuan` | 1556 | 622 | accepted_discount (cost_mismatch) | 8454/8454 | `Rj9aIvwSfFZtI5WPs0rE` | 101.60 | `843716e78abda922f2c044509802996430581cb6398eb801ea371d83fa2df917` |
| vi | `oldquarter-ma-may-caption` | caption | `oldquarter-ma-may` | 69 | 28 | accepted_discount (cost_mismatch) | 8454/8454 | `XV8MRlpE7JIyyCHxaInc` | 6.64 | `5eaa5815f85cc095bcfdb9f19575ee80501926cd25d7b24bcad9d76c6075ee8f` |
| vi | `oldquarter-ma-may-story` | story | `oldquarter-ma-may` | 1776 | 710 | accepted_discount (cost_mismatch) | 8454/8454 | `SjFqTlp4d5lr8LQFdhDm` | 124.88 | `4f80a36715137351c6ac25638c83a7f716a7d3637ccb5c9ce349efbba2dcc083` |
| vi | `oldquarter-ma-may-transition-story` | story | `oldquarter-ma-may` | 365 | 146 | accepted_discount (cost_mismatch) | 9341/9341 | `CoZnuc3Yxr8pIB2IDOwL` | 25.52 | `11bd0c4ddb42b636035a55a55b028cee852ce82805bc879f34d2e1c3b1bcfb26` |
