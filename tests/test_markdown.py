"""Markdown table regressions; run with unittest discover."""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

SITE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SITE_DIR))
from build import build_posts, md_to_html


class MarkdownTests(unittest.TestCase):
    def test_table_semantics_inline_markup_and_alignment(self):
        html = md_to_html(
            "| Plan | Price |\n| :--- | ---: |\n"
            "| **Pro** | [Official](https://example.com) *monthly* |", tables=True
        )
        self.assertIn('role="region" aria-label="Scrollable data table" tabindex="0"', html)
        self.assertIn('<thead>\n<tr><th scope="col">Plan</th><th scope="col" class="align-right">Price</th></tr>', html)
        self.assertIn('<tbody>\n<tr><td><strong>Pro</strong></td>', html)
        self.assertIn('<a href="https://example.com" target="_blank" rel="noopener">Official</a> <em>monthly</em>', html)
        self.assertIn('</tbody>\n</table>\n</div>', html)

    def test_fenced_table_stays_verbatim(self):
        body = '| Plan | Price |\n| --- | --- |\n| **Pro** | <b>20</b> |'
        self.assertEqual(md_to_html('```text\n' + body + '\n```', tables=True),
                         '<pre><code>' + body.replace('<', '&lt;').replace('>', '&gt;') + '</code></pre>')

    def test_paragraph_pipes_and_invalid_delimiters_are_not_tables(self):
        for body in ('A | B\nC | D', 'A | B\n--- | invalid', 'A | B\n--- | --- | ---'):
            with self.subTest(body=body):
                self.assertEqual(md_to_html(body, tables=True), '<p>' + body.replace('\n', ' ') + '</p>')

    def test_column_width_and_optional_outer_pipes(self):
        html = md_to_html('A | B\n--- | ---\none |\n1 | 2 | 3', tables=True)
        self.assertIn('<tr><td>one</td><td></td></tr>', html)
        self.assertIn('<tr><td>1</td><td>2</td></tr>', html)
        self.assertNotIn('<td>3</td>', html)

    def test_escaped_pipes_and_raw_html(self):
        html = md_to_html('| A \\| B | C |\n| --- | --- |\n| `x\\|y` | <script>alert(1)</script> & |', tables=True)
        self.assertIn('<th scope="col">A | B</th>', html)
        self.assertIn('<td><code>x|y</code></td>', html)
        self.assertIn('&lt;script&gt;alert(1)&lt;/script&gt; &amp;', html)
        self.assertNotIn('<script>', html)

    def test_table_stops_before_code_heading_and_paragraph(self):
        table = 'A | B\n--- | ---\n1 | 2\n'
        for suffix, expected in (
            ('```\nx | y\n```', '<pre><code>x | y</code></pre>'),
            ('# Heading | text', '<h2>Heading | text</h2>'),
            ('Following paragraph', '<p>Following paragraph</p>'),
        ):
            with self.subTest(suffix=suffix):
                self.assertTrue(md_to_html(table + suffix, tables=True).endswith('</div>\n' + expected))

    def test_tables_are_opt_in_for_existing_articles(self):
        body = 'A | B\n--- | ---\n1 | 2'
        self.assertEqual(md_to_html(body), '<p>A | B --- | --- 1 | 2</p>')
        self.assertIn('<table>', md_to_html(body, tables=True))

    def test_frontmatter_controls_table_rendering(self):
        body = 'A | B\n--- | ---\n1 | 2'
        with tempfile.TemporaryDirectory() as directory:
            posts = Path(directory)
            (posts / 'enabled.md').write_text('---\ntables: true\n---\n' + body, encoding='utf-8')
            (posts / 'legacy.md').write_text(body, encoding='utf-8')
            with patch('build.POSTS_DIR', posts):
                result = {post['id']: post['html'] for post in build_posts()}
        self.assertIn('<table>', result['enabled'])
        self.assertNotIn('<table>', result['legacy'])

if __name__ == '__main__':
    unittest.main()
