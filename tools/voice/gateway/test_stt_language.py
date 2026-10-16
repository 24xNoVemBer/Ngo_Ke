import unittest

from stt_worker import language_for_locale


class SttLanguageTests(unittest.TestCase):
    def test_vietnamese_request_keeps_vietnamese_asr(self):
        self.assertEqual(language_for_locale("vi"), "vi")

    def test_english_request_selects_english_asr(self):
        self.assertEqual(language_for_locale("en"), "en")

    def test_unsupported_locale_is_rejected(self):
        for locale in ("fr", "EN", None, [], {}):
            with self.subTest(locale=locale):
                with self.assertRaises(ValueError):
                    language_for_locale(locale)


if __name__ == "__main__":
    unittest.main()
