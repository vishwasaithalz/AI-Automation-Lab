import copy
import unittest

from weekly_pack import build_pack, check_week

STORY = {
    "id": "logon-events",
    "title": "Windows security events require context",
    "summary": "A failed logon event is evidence to investigate, not proof of an intrusion.",
    "source_url": "https://github.com/vishwasaithalz/LogSentry",
    "facts": [
        "The LogSentry repository describes Windows event triage for defensive analysis.",
        "Its public documentation calls out synthetic examples and investigation limits."
    ],
    "lesson": "Correlate timestamps, accounts, hosts and adjacent events before making claims.",
    "audience": "technical",
    "devto_tags": ["security", "python"]
}


class WeeklyPackTests(unittest.TestCase):
    def test_one_story_renders_with_all_release_gates(self):
        markdown, out = build_pack({"week_start": "2026-11-10", "stories": [STORY]})
        self.assertEqual(out["publication_count"], 0)
        self.assertEqual(out["queue_count"], 0)
        self.assertIn("HUMAN_APPROVAL_REQUIRED", out["status"])
        self.assertEqual(out["stories"][0]["platforms"]["quora"]["status"], "NEEDS_REAL_QUESTION")
        self.assertEqual(out["stories"][0]["platforms"]["hacker_news"]["status"], "HUMAN_WRITTEN_SUBMISSION_ONLY")
        self.assertIn("[ ] Approve", markdown)

    def test_nostalgia_routes_only_social_default(self):
        s = copy.deepcopy(STORY)
        s["audience"] = "nostalgia"
        _, out = build_pack({"week_start": "2026-11-10", "stories": [s]})
        self.assertEqual(set(out["stories"][0]["platforms"]), {"instagram", "facebook", "x", "youtube"})
        self.assertEqual(out["stories"][0]["platforms"]["youtube"]["status"], "MEDIA_PENDING")

    def test_rejects_duplicate_story(self):
        d = {"week_start": "2026-11-10", "stories": [STORY, STORY]}
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            check_week(d)

    def test_rejects_hn_for_nostalgia(self):
        s = copy.deepcopy(STORY)
        s["audience"] = "nostalgia"
        s["platforms"] = ["hacker_news"]
        with self.assertRaisesRegex(ValueError, "Hacker News"):
            check_week({"week_start": "2026-11-10", "stories": [s]})

    def test_rejects_unchecked_citation(self):
        s = copy.deepcopy(STORY)
        s["source_url"] = "http://localhost"
        with self.assertRaises(ValueError):
            build_pack({"week_start": "2026-11-10", "stories": [s]})

    def test_cannot_output_fake_approved_status(self):
        _, m = build_pack({"week_start": "2026-11-10", "stories": [STORY]})
        for item in m["stories"]:
            for dest in item["platforms"].values():
                self.assertEqual(dest["approval"], "PENDING")
                self.assertIsNone(dest["posting_receipt"])
                self.assertFalse(dest["media_verified"])


if __name__ == "__main__":
    unittest.main()
