import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('question_import', Path(__file__).resolve().parents[1] / 'scripts/import-question-candidates.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CandidateTests(unittest.TestCase):
    def test_numbered_questions_preserve_subparts(self):
        rows = module.candidates('Preface\n1. Find y for x = 2.\na. Explain the slope.\n2. Find the vertex.')
        self.assertEqual(len(rows), 2)
        self.assertIn('a. Explain', rows[0])

    def test_deduplicates_and_keeps_provenance(self):
        rows = module.prepare([(2, 'שאלה 1 מצאו את השיפוע של הישר'), (3, 'שאלה 1 מצאו את השיפוע של הישר')], 'Original workbook', 9, 'he', 'Author supplied')
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['source_page'], 2)
        self.assertEqual(rows[0]['status'], 'needs_human_review')
        self.assertIsNone(rows[0]['activity'])

    def test_html_discards_script_and_keeps_questions(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'source.html'
            path.write_text('<script>secret()</script><p>1. What is the slope?</p><p>2. What is the intercept?</p>', encoding='utf-8')
            pages = module.extract(path)
            self.assertNotIn('secret', pages[0][1])
            self.assertEqual(len(module.candidates(pages[0][1])), 2)

    def test_blank_scan_does_not_invent_questions(self):
        self.assertEqual(module.prepare([(1, '')], 'scan', 10, 'en', 'owned'), [])


if __name__ == '__main__':
    unittest.main()
