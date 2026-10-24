# Ngõ Kể — Hồ Sơ Bàn Giao Triển Khai Kỹ Thuật UI-05B Cho Worker
## (Technical Implementation Handoff — Ticket NK-UI-05B)

**Mã ticket:** `NK-UI-05B`  
**Tiêu đề:** `HeritageSketchPlaceholder Component & NodeVisual Resolver Integration`  
**Ngày lập hồ sơ:** 2026-10-24  
**Tác giả thiết kế:** Antigravity (Senior Mobile UX/UI Designer & Visual Asset Auditor)  
**Worker thực thi dự kiến:** Codex Luna (`gpt-6-luna`/`xhigh`)  
**Trạng thái thiết kế:** **`VISUAL_DESIGN_APPROVED`**  
**Trạng thái lệnh code:** **CHỜ NGƯỜI DÙNG PHÁT LỆNH MỞ CODE (Chưa cấp quyền sửa source)**

---

## 1. Mục Tiêu Triển Khai (Objectives)

1. Xây dựng module phân giải hình ảnh chuẩn mực `mobile/src/assets/nodeVisual.ts` theo hợp đồng discriminated union (`kind: 'photo'` | `kind: 'placeholder'`).
2. Hiện thực thành phần React Native `<HeritageSketchPlaceholder>` hỗ trợ 3 nhóm motif (`relic`, `culinary`, `alley_space`), con dấu triện 2 dòng và nhãn tiêu chuẩn.
3. Tích hợp giải pháp cách ly (`QUARANTINE_APPROVED`) đối với 4 ảnh Google Maps contributor (`dinh-thanh-ha-1`, `chua-cau-dong-1`, `pho-suong-1`, `bun-ca-sam-cay-si-1`), ép chuyển 100% sang placeholder tại runtime.
4. Thay thế triệt để cơ chế fallback âm thầm về `HERO_PHOTO` và credit Pexels sai lệch đối với 9 điểm dừng mới chưa có ảnh.
5. Đấu nối chuẩn xác vào 5 màn hình/thành phần tiêu thụ ảnh (`HomeScreen`, `QaScreen`, `PostcardCard`, `CameraScreen`, `LocationScreen`).

---

## 2. Năm Điều Kiện Bắt Buộc Của Người Dùng (Mandatory Invariants)

> [!IMPORTANT]
> Worker khi triển khai phải tuân thủ nghiêm ngặt 5 ràng buộc bất biến đã được Người dùng phê duyệt:

1. **Tuyệt đối không đưa nội dung chưa xác minh vào runtime:**  
   Không tự ý thêm câu chuyện lịch sử, Q&A, tuyến đường hoặc thời lượng audio chưa duyệt vào file code hoặc dataset JSON.
2. **Không hiển thị thông tin đối soát nội bộ trên UI:**  
   Giao diện người dùng cuối **tuyệt đối không hiển thị** các chuỗi văn bản nội bộ như *"Ảnh Google Maps"* hay *"Rủi ro bản quyền"*.  
   Nhãn duy nhất được hiển thị trên UI là nhãn tiêu chuẩn được bản địa hóa:  
   - Tiếng Việt: `● Đang cập nhật ảnh thực địa`  
   - Tiếng Anh: `● Field photo update in progress`
3. **Tiếp tục cách ly 4 ảnh Google Maps:**  
   Hàm `resolveNodeVisual` luôn trả về `kind: 'placeholder'` cho 4 trạm này. Giữ nguyên 4 tệp JPG trên ổ đĩa để đối soát nguồn gốc, không xóa file.
4. **Không thay đổi logic audio, voice hoặc nội dung ngoài scope:**  
   Bảo toàn nguyên vẹn toàn bộ hệ thống audio, STT/TTS gateway và datasets trong `data/localized/`.
5. **Duy trì tương thích 100% với NK-UI-03 hiện hành:**  
   Khi cập nhật `QaScreen.tsx`, phải giữ nguyên toàn bộ microcopy và affordance voice đã được kiểm chứng của `NK-UI-03`.

---

## 3. Ranh Giới Tập Tin Được Phép Sửa (File Modification Allowlist)

| Hành động | Đường dẫn tập tin | Mục đích & Ranh giới trách nhiệm |
| :---: | :--- | :--- |
| **TẠO MỚI** | `mobile/src/assets/nodeVisual.ts` | Khai báo kiểu `NodeVisual`, hàm `resolveNodeVisual()` và bảng ánh xạ motif. |
| **TẠO MỚI** | `mobile/src/components/HeritageSketchPlaceholder.tsx` | Component hiển thị vector ký họa, con dấu triện 2 dòng và nhãn trạng thái. |
| **TẠO MỚI** | `mobile/tests/nodeVisual.test.mjs` | Bộ unit test kiểm thử phân giải ảnh, cách ly Google Maps và hợp đồng component. |
| **SỬA** | `mobile/src/assets/photoMap.ts` | Xuất khẩu `NODE_PHOTO_MAP` và các helper an toàn (giữ tương thích ngược). |
| **SỬA** | `mobile/src/i18n/translator.ts` | Bổ sung khóa bản dịch `common.photo_updating` (VI / EN). |
| **SỬA** | `mobile/src/screens/HomeScreen.tsx` | Đấu nối `compactPreviewCard`: phân nhánh hiển thị `<CrossfadePhoto>` hoặc `<HeritageSketchPlaceholder>`. |
| **SỬA** | `mobile/src/screens/QaScreen.tsx` | Đấu nối `fullBleedBackground`: phân nhánh hiển thị ảnh hoặc nền ký họa mờ (bảo toàn NK-UI-03). |
| **SỬA** | `mobile/src/components/PostcardCard.tsx` | Đấu nối khung ảnh 4:3 phân nhánh theo `visual.kind`. |
| **SỬA** | `mobile/src/screens/CameraScreen.tsx` | Đấu nối thẻ `activeImage` và thumbnail `nodeThumb`. |
| **SỬA** | `mobile/src/screens/LocationScreen.tsx` | Đấu nối thẻ `currentThumb` và `candidateThumb`. |

> [!CAUTION]
> **CÁC TỆP TUYỆT ĐỐI CẤM SỬA:**
> - `data/localized/*.json` (Không sửa dataset)
> - `mobile/src/hooks/useVoiceChat.ts` (Không sửa logic voice)
> - `tools/**` (Không sửa backend)

---

## 4. Đặc Tả Hợp Đồng Mã Nguồn (TypeScript Contracts)

### 4.1. Contract `mobile/src/assets/nodeVisual.ts`

```typescript
import type { ImageSourcePropType } from 'react-native';

export type VisualMotif = 'relic' | 'culinary' | 'alley_space';

export type NodeVisual =
  | {
      kind: 'photo';
      source: ImageSourcePropType;
      photographer: string;
      isIllustrative?: boolean;
    }
  | {
      kind: 'placeholder';
      motif: VisualMotif;
      siteName: string;
      badgeLabel: string;
      alleyName?: string;
    };

/**
 * 4 Node IDs bị cách ly bản quyền bắt buộc trả về placeholder:
 */
export const QUARANTINED_GOOGLE_MAPS_NODES = new Set([
  'ngo-gach-dinh-thanh-ha',
  'ngo-gach-chua-cau-dong',
  'trung-yen-pho-suong',
  'trung-yen-bun-ca-sam-cay-si',
]);

/**
 * Ánh xạ Motif cho 17 điểm dừng mới:
 */
export const NODE_MOTIF_MAP: Record<string, VisualMotif> = {
  // Relic (Đình, Đền, Chùa)
  'ngo-gach-dinh-thanh-ha': 'relic',
  'ngo-gach-chua-cau-dong': 'relic',
  'trung-yen-dinh-trung-yen': 'relic',
  'tam-thuong-dinh-yen-thai': 'relic',
  'tam-thuong-den-vong-tien': 'relic',
  'cam-chi-den-vong-tien': 'relic',
  'phat-loc-den-tien-ha': 'relic',

  // Culinary (Hàng ăn, Quán phở, Bún)
  'trung-yen-pho-suong': 'culinary',
  'trung-yen-bun-ca-sam-cay-si': 'culinary',
  'trung-yen-bun-ngan-nhan': 'culinary',
  'trung-yen-pho-ga-huong-tra': 'culinary',

  // Alley Space (Không gian ngõ, Cà phê, Vòm ngõ)
  'ngo-gach-ca-phe-no1': 'alley_space',
  'ngo-gach-ta-ca-phe-4': 'alley_space',
  'ngo-gach-cafe-20': 'alley_space',
  'phat-loc-cac-nhanh-ngo': 'alley_space',
  'cam-chi-khong-gian-nghe-thuat': 'alley_space',
  'cam-chi-ngo-hoi-vu': 'alley_space',
};

export function resolveNodeVisual(
  nodeId?: string,
  photoKey?: string,
  collectionId?: string,
  locale: string = 'vi'
): NodeVisual;
```

---

## 5. Tiêu Chuẩn Tạo Hình Cho Component `<HeritageSketchPlaceholder>`

- **Tỉ lệ hỗ trợ:** `4:3` (PostcardCard), `16:9` (Banner), `1:1` (Thumbnail), `full` (QaScreen).
- **Màu nền giấy dó ấm:** `#F7F4EE`, viền `#E2DDD3`.
- **Màu nét vẽ:** Mực than chì `#3D342A` (cho Postcard/Thumb) hoặc xám nhạt `#918A7E` (khi hiển thị `full` làm nền QaScreen).
- **Con dấu triện 2 dòng:**
  - `relic`: Dòng 1 `DI`, dòng 2 `TÍCH`, viền đỏ đất `#9C4F36`, nền `#F6EAE6`.
  - `culinary`: Dòng 1 `ẨM`, dòng 2 `THỰC`, viền xanh rêu `#2D5748`, nền `#E8EFEA`.
  - `alley_space`: Dòng 1 `KHÔNG`, dòng 2 `GIAN`, viền vàng hổ phách `#D49B35`, nền `#FFF4D9`.
- **Huy hiệu trạng thái:** Viên nang viền kép, chấm tròn son đất, nhãn lấy từ `t('common.photo_updating')`.
- **Trợ năng:** `accessibilityLabel` song ngữ mô tả đầy đủ ngữ cảnh ("Hình ký họa minh họa di tích...").

---

## 6. Quy Trình Kiểm Thử & Nghiệm Thu Bắt Buộc (Verification Commands)

Worker sau khi code xong phải chạy và báo cáo đạt 100% các lệnh kiểm tra:

```bash
# 1. Chạy toàn bộ 429 mobile tests hiện hữu + tests mới cho nodeVisual
npm test --prefix mobile

# 2. Kiểm tra type an toàn không lỗi
npm run typecheck --prefix mobile

# 3. Kiểm tra định dạng lint
npm run lint --prefix mobile

# 4. Kiểm tra git diff sạch
git diff --check
```

---

> [!NOTE]
> **TRẠNG THÁI HIỆN TẠI:**  
> Hồ sơ bàn giao này đã sẵn sàng. Khi người dùng phát lệnh chính thức cho phép bắt đầu code Wave 2 / NK-UI-05B, Codex Luna sẽ nhận tài liệu này làm spec chuẩn để triển khai.
