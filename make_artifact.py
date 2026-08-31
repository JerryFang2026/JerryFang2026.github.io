# -*- coding: utf-8 -*-
"""Assemble the single-file artifact version of the site.

Reads artifact_template.html + data/posts.js + data/books.js,
inlines the data, and writes artifact.html.
Run AFTER build.py:  python make_artifact.py
"""
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent
template = (SITE / "artifact_template.html").read_text(encoding="utf-8")

# The highlight() sentinels (U+0001/U+0002) cannot survive some editors;
# rewrite the function with explicit escapes so the JS is always valid.
highlight_fn = (
    "function highlight(text, terms) {\n"
    "  let out = esc(text);\n"
    "  for (const t of terms) {\n"
    "    if (!t) continue;\n"
    "    const re = new RegExp(t.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\"), \"gi\");\n"
    "    out = out.replace(re, (m) => \"\\u0001\" + m + \"\\u0002\");\n"
    "  }\n"
    "  return out.replace(/\\u0001/g, \"<mark>\").replace(/\\u0002/g, \"</mark>\");\n"
    "}"
)
template, n = re.subn(
    r"function highlight\(text, terms\) \{.*?\n\}",
    lambda m: highlight_fn,
    template,
    count=1,
    flags=re.S,
)
assert n == 1, "highlight() not found in template"

posts_js = (SITE / "data" / "posts.js").read_text(encoding="utf-8")
books_js = (SITE / "data" / "books.js").read_text(encoding="utf-8")
data_block = posts_js + "\n" + books_js
assert "/*__DATA__*/" in template
out = template.replace("/*__DATA__*/", data_block)

dest = SITE / "artifact.html"
dest.write_text(out, encoding="utf-8")
print(f"wrote {dest} ({dest.stat().st_size / 1024:.0f} KB)")
