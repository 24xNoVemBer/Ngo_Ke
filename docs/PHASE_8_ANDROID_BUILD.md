# Build Android kiểm thử Phase 8 — 16/10/2026

App source `4b7ffcba918034d3f20501eb2c582bbf8a3c4644` (gồm plugin API-only `0ad83c1`). W2 Antigravity build; W4 Muse cài và kiểm trên emulator. Đây là APK kiểm thử, không phải phát hành store hay bằng chứng điện thoại thật/iOS.

## Kết quả và nguồn kiểm

- APK: `C:/Users/LEGION/orca/workspaces/ngoke/test-antigravity/mobile/android/app/build/outputs/apk/release/app-release.apk`, 125227724 byte.
- SHA-256: `F4FF952226F614F37E6F33BE30375628F38DD1D290021D7C65DAA96204FD2F0E`; W1 hash độc lập, W4 đối chiếu hash bản đã cài.
- Bundle `assets/index.android.bundle`: 1994000 byte; W1 mở ZIP trong bộ nhớ, xác nhận endpoint kiểm thử `http://10.0.2.2:8086` hiện diện. Không in toàn bundle hoặc biến môi trường.
- W2 báo201/201 test, lint/typecheck đạt tại0ad83c1 và4b7ffcb. W1 chạy lại201/201 ở cây mobile giống hệt bản tích hợp; backend19 + guard33 + HTTP15 cũng đạt độc lập.
- Bản APK cũ `BA6D9F…` thiếu API env inline đã bị thay thế; không dùng làm proof live.

## Toolchain thực tế

- Windows, Node24.14.1, Adoptium JDK17 tại `C:/Users/LEGION/.gradle/jdks/eclipse_adoptium-17-amd64-windows.2`; Gradle wrapper9.3.1 của project.
- SDK `C:/Users/LEGION/AppData/Local/Android/Sdk` là Junction có sẵn trỏ `D:/Android/Sdk`. W1 kiểm Junction và binary Ninja; đường dẫn D trong CMakeCache không phải cài SDK mới.
- Build cuối dùng CMake3.22.1/Ninja1.10.2 có sẵn trong SDK, không dùng bản Ninja1.13.2 đã thử ở bước điều tra. Không overwrite binary SDK hoặc đổi registry LongPaths.
- File generated/ignored `mobile/android/gradle.properties`: `org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m`, `org.gradle.parallel=true`, bốn ABI `armeabi-v7a,arm64-v8a,x86,x86_64`, Hermes/new architecture bật. Tăng heap cục bộ khắc phục OOM khi đóng gói; không sửa cấu hình Gradle toàn cục.

## Recipe đã chạy

Dependency đã có theo lockfile; cwd ban đầu `test-antigravity/mobile`:

```powershell
$env:EXPO_PUBLIC_NGOKE_API_BASE_URL = 'http://10.0.2.2:8086'
npx expo prebuild --platform android --no-install
```

Để tránh MAX_PATH, W2 dùng ổ tạm X khi ổ này chưa được sử dụng. Map gốc repo để giữ đúng quan hệ `mobile/android` với `mobile/node_modules`; không map riêng thư mục android:

```powershell
subst X: C:\Users\LEGION\orca\workspaces\ngoke\test-antigravity
$env:ANDROID_HOME = 'C:\Users\LEGION\AppData\Local\Android\Sdk'
$env:JAVA_HOME = 'C:\Users\LEGION\.gradle\jdks\eclipse_adoptium-17-amd64-windows.2'
cmd.exe /c 'cd /d X:\mobile\android && gradlew.bat assembleRelease'
```

Sau khi build kết thúc, W2 gỡ riêng mapping đã tạo bằng `subst X: /D`. Không đổi mapping đang có của người khác; không dừng daemon Java/Gradle chung. `mobile/android/` là generated/ignored; tracked tree W2 sạch sau hai commit source. Không commit APK hoặc thư mục native sinh ra.

App phải đọc trực tiếp `process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL` tại caller. W1 dùng plugin Expo Babel đang cài để tái hiện trước/sau: caller cũ truyền toàn process.env không inline, caller4b7ffcb nhận literal sentinel đúng. Dữ liệu bundle và kiểm live trên APK xác minh đường đi thực tế; chỉ set biến lúc build không đủ chứng minh.

Kết quả native và giới hạn ở `docs/PHASE_8_QA_REPORT.md`; W4c f097b52 đã đóng các ca từ chối quyền/provenance/restore. Không chạy tools/voice hoặc thay audio/matcher cũ trong Phase7.1/8.
