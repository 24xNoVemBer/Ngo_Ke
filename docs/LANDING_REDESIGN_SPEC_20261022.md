# Spec — Thiết kế lại màn Landing (Antigravity thực hiện, Claude review)

Ngày 22/10/2026. Người giao: người dùng ("đẩy cho anti làm, xong m rv lại"). Căn cứ: `docs/reviews/2026-10-22-claude-landing-design-is.md` (15/30, REDESIGN phạm vi Landing). Chủ sở hữu việc: Antigravity. Người review: Claude (theo yêu cầu người dùng, chỉ đợt này).

Người dùng chưa trả lời 3 câu hỏi trong báo cáo. Dùng các lựa chọn em đề xuất làm mặc định và ghi vào báo cáo của bạn rằng đây là mặc định chưa được duyệt:
- DEMO/LIVE là nhãn trạng thái; đổi chế độ nằm trong Sổ tay.
- Bỏ khối quote khỏi Landing; Alley Passport chuyển vào modal Sổ tay.
- Nền mờ (không phải nền đặc).

## Nền làm việc
Cây làm việc hiện có thay đổi chưa commit của đợt hero-moss (`photoMap.ts` HERO_PHOTO, scrim trong `LandingScreen.tsx` và `PrologueScreen.tsx`). Giữ ảnh hero Pexels 28170047 và sắc rêu `rgba(18, 30, 23, α)`; chỉ đổi α theo spec dưới. Không hoàn tác công việc hero-moss. Đừng sửa `PrologueScreen.tsx`.

## Việc cần làm (file chính: `mobile/src/screens/LandingScreen.tsx`)
1. **Nền:** ảnh hero dùng `blurRadius` khoảng 14; scrim đồng nhất khoảng `rgba(18, 30, 23, 0.68)`. Không thêm dependency.
2. **Thẻ ngõ:** ảnh nét chỉ nằm trong thẻ. Mỗi ngõ dùng cover riêng của nó (kiểm `coverPhoto` của từng collection; Ngõ Gạch và Ngõ Trung Yên đã có ảnh trong `mobile/assets/photos/alleys/`). Bỏ scrim 0,45 phủ toàn thẻ; thay bằng dải đáy thẻ nền đặc `rgba(20, 22, 16, 0.78)` chứa quận, tên, tagline, meta. Chữ vàng chỉ nằm trong dải này; ngoài thẻ dùng trắng khoảng 90%.
3. **Header:** logo + nút ngôn ngữ phân đoạn `VI | EN` (ngôn ngữ đang chọn tô sáng, giữ `testID="locale-switch"` và nhãn đọc cho trình đọc màn hình) + một nút "Sổ tay/Notebook" (biểu tượng + chữ) mở `NotebookDrawerModal`. Bỏ pill DEMO dạng nút.
4. **Trạng thái:** một dòng chữ thường dưới header (ví dụ "Truyện chữ · nội dung mô phỏng" / "Text stories · simulated content"), nêu đúng chế độ Demo hoặc Live đang dùng. Bỏ banner xanh và bỏ `· Demo` ở meta thẻ. Đổi tên khóa i18n `landing.soundscape_banner` cho đúng nghĩa (VI và EN cùng đổi, cập nhật mọi chỗ dùng).
5. **Bớt khối:** bỏ khối quote khỏi Landing (giữ khóa dịch nếu chỗ khác dùng; nếu không chỗ nào dùng thì ghi vào báo cáo, không tự xóa file). Đưa nội dung Alley Passport vào modal Sổ tay (`NotebookDrawerModal`), giữ hành vi hiện có của modal Passport. Landing còn: header, dòng trạng thái, carousel ngõ, hai ô công cụ (GPS, Sổ tay). Bỏ pretitle "FEATURED JOURNEYS" và pretitle của mục công cụ; mỗi mục một tiêu đề.
6. **Hai ô công cụ:** cùng chiều cao (`alignItems: 'stretch'`, `minHeight` khoảng 72), tiêu đề 1 dòng, mô tả `numberOfLines={2}`; rút gọn chuỗi dịch VI/EN. Giữ `testID` `landing-quick-gps`, `landing-quick-notebook`, `landing-quick-actions-section`.
7. **Vùng chạm 44 pt:** "See all", nút đóng modal Passport và nút đóng Sổ tay (nếu nhỏ hơn) dùng `minHeight: 44` hoặc `hitSlop`.
8. **Chữ:** cỡ chữ nhỏ nhất 12 px cho văn bản; riêng nhãn viết hoa được 11 px.
9. **Giữ nguyên:** thẻ live-state (loading, error, empty, retry, switch to demo), điều hướng (`AlleySelect`, `Home`, `Location`), pipeline `getLocalizedCollections`/`getBundledDataset`, trạng thái fontScale > 1.2/1.3 (xếp dọc), logo, `useEntranceFadeSlide`.

## Ràng buộc
- Không thêm dependency. Không sửa backend, voice, Q&A, Home, Metro 8082 (không restart). Không commit, không push. Không web/PWA preview.
- Giữ nguyên WIP khác. Không bịa nội dung, nguồn hay ảnh; ảnh chỉ dùng tệp đã có trong repo.
- Nút bánh răng xanh ở ảnh chụp không có trong `mobile/src`; đừng cố sửa, chỉ ghi vào báo cáo nếu bạn tìm thấy nguồn.

## Nghiệm thu (bằng chứng cần nộp)
- `npm test --prefix mobile`, `npm run typecheck --prefix mobile`, `npm run lint --prefix mobile`, `git diff --check`: số liệu thật.
- Test mới, không rỗng: (a) Landing không còn quote/banner/pill DEMO dạng nút; (b) có nút ngôn ngữ phân đoạn và nút Sổ tay; (c) Passport mở được từ trong Sổ tay; (d) đổi chế độ Demo/Live vẫn tới được từ Sổ tay; (e) hai ô công cụ cùng `minHeight` và mô tả `numberOfLines`; (f) vùng chạm 44 pt của các nút nêu trên; (g) VI/EN hiển thị đúng. Cập nhật các test cũ đang kiểm khối bị bỏ; ghi rõ mỗi test đã đổi và lý do.
- Metro 8082 (chỉ đọc): bundle iOS và Android trả HTTP 200.
- Báo cáo ngắn `docs/reviews/2026-10-22-antigravity-landing-redesign.md`: file đã sửa, các mặc định tự chọn, phần chưa kiểm trên máy thật (độ tương phản thực, chữ lớn fontScale 1.3 và 2.0, hiển thị blur trên iOS và Android), và mọi chỗ phải chọn tạm. Không khẳng định tỷ lệ tương phản khi chưa đo.
