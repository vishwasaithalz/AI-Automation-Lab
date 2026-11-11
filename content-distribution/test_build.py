import copy
import tempfile
import unittest
from pathlib import Path

from build import build_drafts, render

EXAMPLE = {
    'id': 'security-logon-events',
    'title': 'Learning from Windows authentication event logs',
    'summary': 'Windows failed logon events are clues, not proof of compromise. Validate timestamps, accounts, hosts and related events before concluding.',
    'source_url': 'https://github.com/vishwasaithalz/LogSentry',
    'facts': [
        'LogSentry documents analysis of imported Windows security events.',
        'The public README describes synthetic fixtures and investigation limits.'
    ],
    'lesson': 'Start with a local reproducible event example before developing automated conclusions.',
    'devto_tags': ['security', 'python', 'opensource']
}


class RenderTests(unittest.TestCase):
    def test_five_channel_manifest_with_quora_gated(self):
        drafts, manifest = build_drafts(EXAMPLE)
        self.assertLessEqual(len(drafts['x']), 280)
        self.assertIn('published: false', drafts['devto'])
        self.assertNotIn('quora', drafts)
        self.assertEqual(manifest['channels']['quora']['status'], 'needs_question')
        self.assertEqual(manifest['publication'], 'NOT_PUBLISHED')

    def test_quora_requires_both_question_and_url(self):
        a = copy.deepcopy(EXAMPLE)
        a['quora_question'] = 'How do I investigate failed Windows logons?'
        with self.assertRaises(ValueError):
            build_drafts(a)
        a['quora_url'] = 'https://www.quora.com/Some-real-question'
        drafts, manifest = build_drafts(a)
        self.assertIn('quora', drafts)
        self.assertEqual(manifest['channels']['quora']['status'], 'draft_ready')

    def test_bad_source_rejected(self):
        a = copy.deepcopy(EXAMPLE)
        a['source_url'] = 'http://localhost:8080'
        with self.assertRaises(ValueError):
            build_drafts(a)

    def test_repeatable_offline_artifacts(self):
        with tempfile.TemporaryDirectory() as t:
            path = Path(t)
            one = render(EXAMPLE, path)
            contents = (path / 'manifest.json').read_text(encoding='utf-8')
            two = render(EXAMPLE, path)
            self.assertEqual(one, two)
            self.assertEqual(contents, (path / 'manifest.json').read_text(encoding='utf-8'))
            self.assertEqual(len(list(path.glob('*'))), 5)


if __name__ == '__main__':
    unittest.main()
