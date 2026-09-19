# -*- coding: utf-8 -*-
"""Assemble the single-file artifact version of the site.

Reads artifact_template.html + data/posts.js + data/books.js,
inlines the data, and writes artifact.html.
Run AFTER build.py:  python make_artifact.py
"""
import re
import json
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
library_html = (SITE / "library.html").read_text(encoding="utf-8")
library_main = re.search(r'<main class="wrap library-wrap">(.*?)</main>', library_html, re.S).group(1)
access_js = (SITE / "data/reading_access.js").read_text(encoding="utf-8")
shared_js = "\n".join((SITE / name).read_text(encoding="utf-8") for name in ["assets/catalogue-core.js", "assets/library.js"])
config_js = "window.CATALOGUE_BOOK_BASE='https://jerryfang2026.github.io/books/';\nwindow.CATALOGUE_LIBRARY_HTML=" + json.dumps(library_main,ensure_ascii=False).replace("</", "<\\/") + ";\n"
data_block = posts_js + "\n" + books_js + "\n" + access_js + "\n" + config_js + shared_js
template = template.replace("</head>", "<style>" + (SITE / "assets/style.css").read_text(encoding="utf-8") + "</style></head>")
assert "/*__DATA__*/" in template
out = template.replace("/*__DATA__*/", data_block)

dest = SITE / "artifact.html"
dest.write_text(out, encoding="utf-8")
print(f"wrote {dest} ({dest.stat().st_size / 1024:.0f} KB)")
