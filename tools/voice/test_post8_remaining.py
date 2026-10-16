import json
import unittest

from post8_remaining import FICTION, PILOT, fiction_rows, inventory, remaining_pilot_rows


class RemainingInventoryTests(unittest.TestCase):
    def test_exact_missing_inventory_and_ids(self):
        rows = inventory()
        self.assertEqual((len(rows["en"]), len(rows["vi"])), (44, 10))
        fiction = [row for row in rows["en"] if row[0] == "fiction-letter"]
        pilot_en = [row for row in rows["en"] if row[0] == "old-quarter-pilot"]
        self.assertEqual(len(fiction), 34)
        self.assertEqual(len(pilot_en), 10)
        self.assertEqual(len(rows["vi"]), 10)
        self.assertEqual(len({(collection, row["id"]) for collection, _, _, row in rows["en"]}), 44)
        self.assertEqual(len({row["id"] for _, _, _, row in rows["vi"]}), 10)

    def test_fiction_tracks_cover_six_nodes_and_all_source_answers(self):
        dataset = json.loads(FICTION.read_text(encoding="utf-8"))
        rows = fiction_rows(dataset)
        self.assertEqual([row["kind"] for row in rows].count("intro"), 1)
        self.assertEqual([row["kind"] for row in rows].count("story"), 6)
        self.assertEqual([row["kind"] for row in rows].count("caption"), 6)
        self.assertEqual([row["kind"] for row in rows].count("answer"), 21)
        self.assertEqual({row["nodeId"] for row in rows if row.get("nodeId")},
                         {node["id"] for node in dataset["nodes"]})
        self.assertEqual({row["id"] for row in rows if row["kind"] == "answer"},
                         {f"{answer['id']}-answer" for answer in dataset["qa"]})

    def test_remaining_pilot_tracks_are_only_the_two_other_approved_nodes(self):
        for locale, path in PILOT.items():
            dataset = json.loads(path.read_text(encoding="utf-8"))
            rows = remaining_pilot_rows(dataset)
            self.assertEqual({row["nodeId"] for row in rows},
                             {node["id"] for node in dataset["nodes"] if node["id"] != "oldquarter-bach-ma"})
            self.assertTrue(all(node_id != "oldquarter-bach-ma" for node_id in (row.get("nodeId") for row in rows)))
            self.assertEqual([row["kind"] for row in rows].count("story"), 2)
            self.assertEqual([row["kind"] for row in rows].count("caption"), 2)
            self.assertEqual([row["kind"] for row in rows].count("answer"), 6)


if __name__ == "__main__":
    unittest.main()
