import unittest

from post8_asr_probe import unicode_codeword_spellings
from post8_probe import (
    POINT_ID,
    PRONUNCIATION_CHECK,
    PRONUNCIATION_MAP,
    assert_no_unknown_phonemes,
    extract_tracks,
    to_spoken_text,
)


def pilot_fixture():
    return {
        "schemaVersion": 2,
        "locale": "en",
        "collectionId": "old-quarter-pilot",
        "intro": {"text": "Welcome to the Old Quarter.", "reviewStatus": "approved"},
        "nodes": [{
            "id": POINT_ID,
            "story": "A reviewed story.",
            "caption": "A reviewed caption.",
            "reviewStatus": "approved",
        }],
        "qa": [
            {"id": "bm-observe", "nodeId": POINT_ID, "answer": "Observe the roof.", "reviewStatus": "approved"},
            {"id": "bm-horse", "nodeId": POINT_ID, "answer": "A white horse.", "reviewStatus": "approved"},
            {"id": "bm-guardian", "nodeId": POINT_ID, "answer": "Long Đỗ is honoured.", "reviewStatus": "approved"},
        ],
    }


class Post8ProbeTests(unittest.TestCase):
    def test_extracts_only_six_approved_bach_ma_tracks(self):
        tracks = extract_tracks(pilot_fixture())
        self.assertEqual(
            [track_id for track_id, _ in tracks],
            [
                "intro",
                f"{POINT_ID}-story",
                f"{POINT_ID}-caption",
                "bm-guardian-answer",
                "bm-horse-answer",
                "bm-observe-answer",
            ],
        )

    def test_rejects_unapproved_answers(self):
        data = pilot_fixture()
        data["qa"][0]["reviewStatus"] = "draft"
        with self.assertRaisesRegex(ValueError, "three approved"):
            extract_tracks(data)

    def test_synthetic_sentence_covers_pronunciation_inputs(self):
        for token in (
            "Bạch Mã", "Long Đỗ", "87 Mã Mây", "Đồng Xuân", "bún chả", "bún ốc",
            "bánh tôm", "An", "Lâm", "Hương", "Nhi", "feel a little more like home",
        ):
            self.assertIn(token, PRONUNCIATION_CHECK)

    def test_tts_map_is_finite_and_does_not_rewrite_english_substrings(self):
        source = ", ".join(source for source, _ in PRONUNCIATION_MAP)
        expected = ", ".join(spoken for _, spoken in PRONUNCIATION_MAP)
        self.assertEqual(to_spoken_text(source), expected)
        self.assertEqual(
            to_spoken_text("Cô, bà; bún đậu; bánh đậu xanh; chè; nộm; bún, bánh, đậu; Bún ốc."),
            "Koh, Bah; boon doh; bahn doh sahn; cheh; nohm; boon, bahn, doh; boon awk.",
        )
        self.assertEqual(
            to_spoken_text("An, Lâm's story; an old plan, ancient streets, and a name."),
            "Ahn, Lahm's story; an old plan, ancient streets, and a name.",
        )

    def test_g2p_unknown_tokens_fail(self):
        assert_no_unknown_phonemes("af_heart", "intro", ["həloʊ"])
        with self.assertRaisesRegex(RuntimeError, "Unknown G2P token"):
            assert_no_unknown_phonemes("af_heart", "intro", ["həloʊ", "❓"])

    def test_english_asr_flags_unicode_codeword_spellings(self):
        self.assertTrue(unicode_codeword_spellings("B Letter 1 E A 1 C H Ma"))
        self.assertTrue(unicode_codeword_spellings("Long Distro Letter 1 ED7"))
        self.assertEqual(unicode_codeword_spellings("A letter to the editor."), [])


if __name__ == "__main__":
    unittest.main()
