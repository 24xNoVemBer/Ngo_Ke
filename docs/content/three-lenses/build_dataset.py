"""Build the scoped demo dataset and complete script from the supplied document.

No existing dataset/audio is modified. English is editorially maintained next to
the source snapshot; the paired IDs and first-chapter/core text stay identical.
"""
from pathlib import Path
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
COLLECTION = "old-quarter-three-lenses"
DOC_URL = "https://docs.google.com/document/d/1VwiCcG2BQKD8-t-Yu5VfgXxJ1qGcWayaaTd4upHu4OI/edit"
STAMP = "2026-10-19T00:00:00Z"
NODES = ["oldquarter-bach-ma", "oldquarter-ma-may", "oldquarter-dong-xuan"]
CHAPTER_IDS = ["bach-ma", "ma-may", "dong-xuan-timeline", "dong-xuan-fire", "dong-xuan-street"]
NODE_INDEX = [0, 1, 2, 2, 2]
HEADINGS = ["ĐỊA ĐIỂM 01 —", "ĐỊA ĐIỂM 02 —", "CHƯƠNG 3.1 —", "CHƯƠNG 3.2 —", "CHƯƠNG 3.3 —"]
QA_IDS = ["bm-deity", "bm-name", "bm-east", "mm-layout", "mm-trade", "mm-restore", "mm-date", "dx-history", "dx-banner", "dx-facade", "dx-fire", "dx-rebuild", "dx-fountain", "dx-trade", "dx-goods", "dx-stalls"]
ALIASES_VI = [
    ["đền thờ ai", "thần Long Đỗ"], ["vì sao gọi là Bạch Mã", "truyền thuyết ngựa trắng"],
    ["đền Bạch Mã trấn nào", "trấn Đông"], ["vì sao nhà hẹp", "kiến trúc nhà ống"],
    ["ngày xưa bán gì", "gạo và thuốc Bắc"], ["năm tu bổ nhà", "tu bổ năm nào"],
    ["năm xây dựng chính xác", "ngôi nhà xây khi nào"], ["chợ có từ bao giờ", "dãy nhà chợ năm 1890"],
    ["băng rôn ba mươi năm", "1996 đến 2026 là gì"], ["mặt tiền có nguyên từ 1890", "mặt tiền nguyên gốc"],
    ["chợ cháy năm nào", "vụ cháy năm 1994"], ["xây lại sau cháy", "xây lại năm 1995"],
    ["đài phun nước có từ bao giờ", "tuổi đài phun nước"], ["vì sao là đầu mối giao thương", "kết nối giao thông buôn bán"],
    ["mặt hàng ngày xưa", "hàng hóa trong quá khứ"], ["quán ăn đều lâu đời không", "quán gia truyền quanh chợ"]
]
SOURCE_ROWS = {
    "BM-01": ("Hoàn Kiếm 360 — Đền Bạch Mã", "https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/den-bach-ma.html"),
    "BM-02": ("Báo Điện tử Chính phủ — Tứ trấn Hà Nội", "https://thanglong.chinhphu.vn/tu-tran-ha-noi-net-van-hoa-lich-su-dac-sac-10323385.htm"),
    "MM-01": ("Cục Di sản văn hóa — Nhà số 87 Mã Mây", "https://dsvh.gov.vn/nha-so-87-ma-may-thanh-pho-ha-noi-22260"),
    "MM-02": ("Hoàn Kiếm 360 — Ngôi nhà di sản 87 Mã Mây", "https://hoankiem360.tourism.vn/chi_tiet_pho_co/ngoi-nha-di-san-87-ma-may.html"),
    "MM-03": ("Báo Điện tử Chính phủ — Nơi lưu giữ nếp nhà người Việt", "https://thanglong.chinhphu.vn/noi-luu-giu-nep-nha-nguoi-viet-10332566.htm"),
    "DX-01": ("Trung tâm Lưu trữ quốc gia I — Chợ Đồng Xuân đầu thế kỷ XX", "https://www.archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/cho-dong-xuan-dau-the-ki-20-khi-hai-day-nha-khung-thep-khong-con-du-che-nhip-song-pho-thi.htm"),
    "DX-02": ("Công ty Cổ phần Đồng Xuân — Thông tin chung", "https://www.dongxuancorp.com/thong-tin-chung-ve-cong-ty-co-phan-dong-xuan"),
    "DX-03": ("VnExpress — Hơn 100 năm tồn tại của chợ Đồng Xuân", "https://vnexpress.net/hon-100-nam-ton-tai-cua-cho-dong-xuan-3735553.html"),
    "DX-04": ("Hoàn Kiếm 360 — Chợ Đồng Xuân", "https://hoankiem360.tourism.vn/chi_tiet_di_tich_lich_su/cho-dong-xuan.html")
}
CHAPTER_SOURCES = [["BM-01", "BM-02"], ["MM-01", "MM-02", "MM-03"], ["DX-01", "DX-02"], ["DX-03", "DX-04"], ["DX-04", "DX-01"]]


def clean(text):
    text = text.replace("________________", "").strip()
    return "\n".join(re.sub(r"^\*\s+", "• ", line.strip()) for line in text.splitlines()).strip()


def canonical_hash(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf8")
    return hashlib.sha256(raw).hexdigest()


def evidence(keys):
    return [f"{key} — {SOURCE_ROWS[key][0]}: {SOURCE_ROWS[key][1]}" for key in keys] + [f"Kịch bản người dùng cung cấp / supplied script: {DOC_URL}"]


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf8")


def build():
    source = (HERE / "USER_SCRIPT_VI.txt").read_text(encoding="utf-8-sig").replace("\r", "")
    english = json.loads((HERE / "EN_AUTHORING.json").read_text(encoding="utf8"))
    vi_editorial = json.loads((HERE / "VI_AUTHORING.json").read_text(encoding="utf8"))
    en_editorial = json.loads((HERE / "EN_NARRATIVE.json").read_text(encoding="utf8"))
    english.update({key: en_editorial[key] for key in ("intro", "transitions", "closing")})
    for original, richer in zip(english["chapters"], en_editorial["chapters"], strict=True):
        original.update(richer)
    vi_chapters, vi_qa, transitions = [], [], []
    for i, heading in enumerate(HEADINGS):
        section = source[source.index(heading):]
        hook, story, observation = re.search(r"2\. Hook[^\n]*\n(.*?)\n3\. Lời kể chính\n(.*?)\n4\. Hướng dẫn quan sát\n(.*?)\n5\. Q&A", section, re.S).groups()
        title = ["Ngựa trắng và trấn Đông Thăng Long", "Một mái nhà, nhiều thế hệ", "Chợ Đồng Xuân: hơn một thế kỷ thay đổi", "Ngọn lửa năm 1994", "Nhịp sống bên hông chợ"][i]
        hook, story, observation = map(clean, (hook, story, observation))
        if i == 2:
            hook = "Trong ảnh khảo sát năm 2026, trên mặt tiền Chợ Đồng Xuân có băng-rôn kỷ niệm ba mươi năm. Nhưng bạn có biết lịch sử khu chợ này đã kéo dài hơn một thế kỷ?"
            story = story.replace("băng-rôn bạn nhìn thấy", "băng-rôn trong ảnh năm 2026")
        if i == 3:
            story = story.replace("Bước vào Chợ Đồng Xuân, bạn có thể bắt gặp", "Trong ảnh nội thất Chợ Đồng Xuân do người dùng cung cấp, có")
        vi_chapters.append({"title": title, "hook": vi_editorial["chapters"][i]["hook"], "story": vi_editorial["chapters"][i]["story"], "observation": observation, "photoKey": CHAPTER_IDS[i]})
        qa_section = re.search(r"5\. Q&A[^\n]*\n(.*?)\n6\. Kiểm chứng", section, re.S).group(1)
        pairs = re.findall(r"Câu hỏi \d+: (.*?)\nTrả lời: (.*?)(?=\nCâu hỏi \d+:|\Z)", qa_section, re.S)
        assert len(pairs) == [3, 4, 3, 3, 3][i], (i, len(pairs))
        for question, answer in pairs:
            vi_qa.append({"question": clean(question), "answer": clean(answer), "chapterIndex": i})
        if i < 2:
            transition = re.search(r"8\. Chuyển tiếp sang địa điểm tiếp theo\n(.*?)(?=\nĐỊA ĐIỂM|\Z)", section, re.S).group(1)
            transition = clean(transition) + "\n\nĐây là chuyển đoạn câu chuyện, không phải chỉ dẫn đường đi."
            transitions.append(transition)
    intro_section = source[source.index("PHẦN MỞ ĐẦU —"):source.index(HEADINGS[0])]
    intro_hook, intro_body = re.search(r"\nHook\n(.*?)\nLời dẫn\n(.*)", intro_section, re.S).groups()
    vi_intro = clean(intro_hook) + "\n\n" + clean(intro_body) + "\n\nĐây là ba địa điểm thực trong phố cổ, không phải ba trạm của cùng một con ngõ. Trải nghiệm không cung cấp dẫn đường."
    closing = clean(re.search(r"PHẦN KẾT THÚC —[^\n]*\nLời kết\n(.*?)\nPHỤ LỤC A", source, re.S).group(1))
    vi_intro, transitions, closing = vi_editorial["intro"], vi_editorial["transitions"], vi_editorial["closing"]
    old = json.loads((ROOT / "data/localized/old-quarter.vi.json").read_text(encoding="utf8"))
    assert len(vi_qa) == len(english["qa"]) == 16

    for locale in ("vi", "en"):
        is_vi = locale == "vi"
        authored = vi_chapters if is_vi else english["chapters"]
        chapters = []
        for i, row in enumerate(authored):
            node_id = NODES[NODE_INDEX[i]]
            content_id = f"{node_id}-story" if i < 3 else f"{node_id}-{'fire' if i == 3 else 'street'}-story"
            text = row["hook"] + "\n\n" + row["story"] + ("\n\nGợi ý quan sát\n" if is_vi else "\n\nLook closer\n") + row["observation"]
            assert len(text) <= 2000, (locale, i, len(text))
            chapters.append({"id": CHAPTER_IDS[i], "nodeId": node_id, "title": row["title"], "text": text, "voiceContentId": content_id, "photoKey": row["photoKey"], "qaIds": [QA_IDS[j] for j, q in enumerate(vi_qa) if q["chapterIndex"] == i], "evidence": evidence(CHAPTER_SOURCES[i]), "verification": "LEGEND" if i == 0 else "SOURCED_ONLY"})
        transition_rows = [{"id": f"transition-{i + 1}", "nodeId": NODES[i], "title": ("Chuyển đoạn" if is_vi else "Continue the journey"), "text": text, "voiceContentId": f"{NODES[i]}-transition-story", "evidence": evidence(CHAPTER_SOURCES[i] + CHAPTER_SOURCES[i + 1])} for i, text in enumerate(transitions if is_vi else english["transitions"])]
        companion = {
            "schemaVersion": 1, "collectionId": COLLECTION, "locale": locale,
            "title": "Ba lát cắt phố cổ" if is_vi else english["title"],
            "tagline": "Từ tín ngưỡng, nếp nhà đến nhịp chợ" if is_vi else english["tagline"],
            "verification": "SOURCED_ONLY", "officiallyApproved": False,
            "sourceDocument": DOC_URL, "chapters": chapters, "transitions": transition_rows,
            "closing": {"id": "closing", "nodeId": NODES[-1], "title": "Những câu chuyện vẫn tiếp diễn" if is_vi else "The stories continue", "text": closing if is_vi else english["closing"], "voiceContentId": f"{NODES[-1]}-closing-story", "evidence": evidence(["BM-01", "MM-01", "DX-01"])},
            "photoCredit": "Ảnh từ tài liệu người dùng cung cấp; quyền sử dụng chưa được kiểm chứng độc lập." if is_vi else "Photos from the supplied document; usage rights have not been independently verified.",
            "photoContext": "Ảnh khảo sát trong tài liệu; băng-rôn được ghi nhận năm 2026, không phải cam kết hiện trạng khi đến." if is_vi else "Document survey photos; the banner is dated 2026, not a guarantee of current conditions."
        }
        script_revision = canonical_hash(companion)
        nodes = []
        names = ["Đền Bạch Mã", "Nhà di sản 87 Mã Mây", "Chợ Đồng Xuân"] if is_vi else english["nodeNames"]
        summaries = ["Thần Long Đỗ, truyền thuyết ngựa trắng và trấn Đông Thăng Long.", "Nhà ống, sân lấy sáng và nếp sống gắn với buôn bán ở phố cổ.", "Ba chương trong một địa điểm: lịch sử, vụ cháy 1994 và nhịp sống bên chợ."] if is_vi else english["summaries"]
        captions = ["Bạch Mã: nơi thờ tự; câu chuyện ngựa trắng được trình bày là truyền thuyết.", "87 Mã Mây: mặt phố hẹp, chiều sâu dài, sân đón ánh sáng và không khí.", "Đồng Xuân: ba chương khám phá ở cùng một địa điểm thật, không phải ba điểm GPS."] if is_vi else english["captions"]
        for i, node_id in enumerate(NODES):
            previous = old["nodes"][i]
            nodes.append({"id": node_id, "name": names[i], "summary": summaries[i], "tags": ["chuyen xua", "kham pha tu do"] + (["an thuc"] if i == 2 else []), "visitMinutes": [15, 15, 20][i], "available": True, "visited": False, "story": chapters[i]["text"], "caption": captions[i], "latitude": previous["latitude"], "longitude": previous["longitude"], "evidence": chapters[i]["evidence"] + (["Geometry tham khảo từ pilot/OSM, chưa khảo sát thực địa: https://www.openstreetmap.org/copyright"] if i else []), "reviewStatus": "approved", "updatedAt": STAMP})
        qa = []
        for i, vi_row in enumerate(vi_qa):
            row = vi_row if is_vi else english["qa"][i]
            chapter_index = vi_row["chapterIndex"]
            same_node = [j for j, item in enumerate(vi_qa) if NODE_INDEX[item["chapterIndex"]] == NODE_INDEX[chapter_index] and j != i]
            answer = row["answer"]
            if is_vi and i == 8:
                answer += " Băng-rôn là chi tiết trong ảnh được ghi nhận năm 2026."
            qa.append({"id": QA_IDS[i], "nodeId": NODES[NODE_INDEX[chapter_index]], "question": row["question"], "answer": answer, "aliases": ALIASES_VI[i] if is_vi else row["aliases"], "evidence": evidence(CHAPTER_SOURCES[chapter_index]), "followUps": [QA_IDS[j] for j in same_node[:2]], "tags": nodes[NODE_INDEX[chapter_index]]["tags"], "reviewStatus": "approved", "updatedAt": STAMP})
        disclaimer = ("DEMO · Có nguồn tham khảo (SOURCED_ONLY), chưa được đơn vị quản lý di tích duyệt chính thức. Truyền thuyết không phải sử liệu đã chứng minh. Ảnh do người dùng cung cấp, quyền chưa kiểm chứng độc lập; băng-rôn thuộc ảnh năm 2026. Thời lượng tham quan là gợi ý biên tập, không phải ETA; tọa độ tham khảo từ pilot/OpenStreetMap, chưa khảo sát thực địa, không dẫn đường. © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright" if is_vi else "DEMO · Sourced reference content (SOURCED_ONLY), not officially approved by site managers. Legends are not proven historical events. Supplied photos have no independently verified rights clearance; the banner belongs to a 2026 photo. Visit times are editorial suggestions, not walking ETAs; pilot/OpenStreetMap coordinates are not field-surveyed. No navigation. © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright")
        dataset = {"schemaVersion": 2, "collectionId": COLLECTION, "locale": locale, "kind": "reviewed", "scriptRevision": script_revision, "disclaimer": disclaimer, "intro": {"text": vi_intro if is_vi else english["intro"], "evidence": evidence(["BM-01", "MM-01", "DX-01"]), "reviewStatus": "approved", "updatedAt": STAMP}, "startNodeId": NODES[0], "nodes": nodes, "qa": qa, "reviewStatus": "approved", "updatedAt": STAMP}
        companion["scriptRevision"] = script_revision
        companion["datasetRevision"] = canonical_hash(dataset)
        assert all(n["story"] == chapters[i]["text"] for i, n in enumerate(nodes))
        write_json(ROOT / f"data/localized/three-lenses.{locale}.json", dataset)
        write_json(ROOT / f"data/journeys/three-lenses.{locale}.json", companion)
        print(f"{locale}: 3 nodes, {len(chapters)} chapters, {len(qa)} QA; 28 audio identities; revision={companion['datasetRevision']}; story lengths={[len(c['text']) for c in chapters]}")


if __name__ == "__main__":
    build()
