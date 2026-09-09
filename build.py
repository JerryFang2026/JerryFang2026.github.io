# -*- coding: utf-8 -*-
"""Build script for the site.

Reads:
  - ../outputs/book_catalog_20260809/data/*.jsonl  (book catalog)
  - posts/*.md                                     (blog posts, frontmatter + markdown)
Writes:
  - data/books.js   -> window.LIBRARY
  - data/posts.js   -> window.POSTS

Run:  python build.py
No third-party dependencies. Safe to re-run any time.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent
CATALOG = SITE_DIR.parent / "outputs" / "book_catalog_20260809" / "data"
# Later batches: (data dir, structured-TOC file). Each has books.jsonl, sources.jsonl, topics_new.json, merge_map.json.
EXTRA_CATALOGS = [
    (SITE_DIR.parent / "outputs" / "book_catalog_20260908" / "data", "toc_entries_vision.jsonl"),
    (SITE_DIR.parent / "outputs" / "book_catalog_20260909" / "data", "toc_entries_vision.jsonl"),
]
POSTS_DIR = SITE_DIR / "posts"
DATA_OUT = SITE_DIR / "data"

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def read_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    return text


# ---------------------------------------------------------------- library ---

# English topic names for the site (catalog data keeps the original Chinese).
TOPIC_EN = {
    "地下水基础": "Groundwater Fundamentals",
    "含水层水力学与井流": "Aquifer & Well Hydraulics",
    "水化学与水质": "Hydrochemistry & Water Quality",
    "污染场地与修复": "Contaminated Land & Remediation",
    "水资源评价与管理": "Resource Evaluation & Management",
    "野外调查与监测": "Field Methods & Monitoring",
    "工程降水与地下水控制": "Dewatering & Groundwater Control",
    "多孔介质流动": "Flow in Porous Media",
    "农业排水与盐渍化": "Land Drainage & Salinity",
    "环境法与监管": "Environmental Law & Regulation",
    "放射性废物与处置地质": "Radioactive Waste & Disposal Geology",
    "危险物质与应急响应": "Hazardous Materials & Spill Response",
    "饮用水与工业水处理": "Water Treatment & Purification",
    "物理水文学与流域过程": "Physical Hydrology & Catchments",
    "地下水—工程地质": "Groundwater in Engineering Geology",
    "地热、矿山与能源": "Geothermal, Mining & Energy",
    "历史案例与制度": "Historical Cases & Institutions",
}

I18N_PATH = Path(__file__).resolve().parent / "i18n" / "books_en.json"


def shelf_location(raw: str) -> str:
    """All books live in the MSc classroom (Room G15, University of Birmingham).
    Earlier catalog data guessed box numbers; keep only the capture order."""
    import re as _re
    m = _re.search(r"capture order (\d+)", raw or "")
    order = f" · photo sequence {m.group(1)}" if m else ""
    return "Room G15 (MSc room), University of Birmingham" + order


def load_book_i18n() -> dict[str, dict]:
    if I18N_PATH.exists():
        rows = json.loads(I18N_PATH.read_text(encoding="utf-8"))
        return {r["book_id"]: r for r in rows}
    return {}


def load_structured_toc(catalog: Path = CATALOG, toc_file: str = "toc_entries_deepseek.jsonl") -> dict[str, list[dict]]:
    """Structured TOC entries per book: [{img, entries: [{l, t, p}]}], photo order.

    Source: the batch's structured-TOC file (DeepSeek extraction), overridden per
    page by toc_entries_fixes.jsonl (manual/vision QA). Near-duplicate photos of
    the same contents page are collapsed to the richer capture.
    """
    src = catalog / toc_file
    if not src.exists():
        return {}
    rows = [json.loads(l) for l in src.read_text(encoding="utf-8").splitlines() if l.strip()]

    fixes_path = catalog / "toc_entries_fixes.jsonl"
    if fixes_path.exists():
        fixes = {
            json.loads(l)["toc_page_id"]: json.loads(l)
            for l in fixes_path.read_text(encoding="utf-8").splitlines() if l.strip()
        }
        rows = [fixes.get(r["toc_page_id"], r) for r in rows]

    unverified_path = catalog / "toc_pages_unverified.json"
    unverified = set(json.loads(unverified_path.read_text(encoding="utf-8")).get("source_files", [])) if unverified_path.exists() else set()

    rows.sort(key=lambda r: r["source_file"])
    by_book: dict[str, list[dict]] = {}
    for r in rows:
        unv = r["source_file"] in unverified and r.get("model") != "fable-visual-qa"
        entries = [
            {"l": e.get("level", 1), "t": clean_text(str(e.get("title", ""))), "p": e.get("page"), **({"u": 1} if unv else {})}
            for e in r.get("entries", [])
            if clean_text(str(e.get("title", "")))
        ]
        if not entries:
            continue
        img = r["source_file"].replace(".HEIC", "")
        pages = by_book.setdefault(r["book_id"], [])
        if pages:
            prev = {(e["t"], str(e["p"])) for e in pages[-1]["entries"]}
            cur = {(e["t"], str(e["p"])) for e in entries}
            overlap = len(prev & cur) / max(1, min(len(prev), len(cur)))
            if overlap > 0.7:  # duplicate photo of the same page — keep richer capture
                if len(entries) > len(pages[-1]["entries"]):
                    pages[-1] = {"img": img, "entries": entries, "verified": r.get("model") == "fable-visual-qa"}
                continue
        pages.append({"img": img, "entries": entries, "verified": r.get("model") == "fable-visual-qa"})
    return by_book


_ENUM_RE = re.compile(r"^\s*(?:(?:chapter|part|unit|appendix|section)\s+)?(?:[ivxlcdm]{1,6}[.):]|\d+(?:\.\d+)*[.):]?|[a-z][.)])\s+", re.I)


def _norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", _ENUM_RE.sub("", str(t).lower())).strip()


def _same_page_index(existing, pg):
    """Index of the page in `existing` that is the same physical contents page as `pg`
    (fuzzy: >50% of the shorter page's section titles in common, enumerators ignored)."""
    cur = {_norm_title(e["t"]) for e in pg["entries"] if _norm_title(e["t"])}
    best, best_ratio = None, 0.0
    for j, old in enumerate(existing):
        prev = {_norm_title(e["t"]) for e in old["entries"] if _norm_title(e["t"])}
        ratio = len(cur & prev) / max(1, min(len(cur), len(prev)))
        if ratio > best_ratio:
            best, best_ratio = j, ratio
    return best if best_ratio > 0.5 else None


def build_library() -> dict:
    books = read_jsonl(CATALOG / "books.jsonl")
    toc_pages = read_jsonl(CATALOG / "toc_pages.jsonl")
    topics = read_jsonl(CATALOG / "topics.jsonl")
    sources = read_jsonl(CATALOG / "sources.jsonl")

    toc_by_book: dict[str, list[str]] = {}
    seen: dict[str, set[str]] = {}
    for page in toc_pages:
        bid = page["book_id"]
        text = clean_text(page.get("ocr_en") or "")
        if not text:
            continue
        key = text[:160]
        if key in seen.setdefault(bid, set()):
            continue  # duplicate photo of the same TOC page
        seen[bid].add(key)
        toc_by_book.setdefault(bid, []).append(text)

    sources_by_book: dict[str, list[dict]] = {}
    for src in sources:
        sources_by_book.setdefault(src["book_id"], []).append(
            {
                "title": src.get("title", ""),
                "url": src.get("url", ""),
                "type": src.get("source_type", ""),
                "supports": src.get("supports", ""),
            }
        )

    i18n = load_book_i18n()
    structured_toc = load_structured_toc()

    # Later batches: append their books/sources/topics; enrich batch-1 records
    # with contents photos of books that turned out to be duplicates.
    for cat_dir, toc_file in EXTRA_CATALOGS:
        if not (cat_dir / "books.jsonl").exists():
            continue
        books.extend(read_jsonl(cat_dir / "books.jsonl"))
        for src in read_jsonl(cat_dir / "sources.jsonl"):
            sources_by_book.setdefault(src["book_id"], []).append(
                {"title": src.get("title", ""), "url": src.get("url", ""), "type": src.get("source_type", ""), "supports": src.get("supports", "")}
            )
        if (cat_dir / "topics_new.json").exists():
            have = {t["name"] for t in topics} | {TOPIC_EN.get(t["name"], t["name"]) for t in topics}
            topics.extend(t for t in json.loads((cat_dir / "topics_new.json").read_text(encoding="utf-8")) if t["name"] not in have)
        extra_toc = load_structured_toc(cat_dir, toc_file)
        merge_map = json.loads((cat_dir / "merge_map.json").read_text(encoding="utf-8")) if (cat_dir / "merge_map.json").exists() else {}
        local_ids = {b.get("batch_local_id"): b["book_id"] for b in books if b.get("batch_local_id")}
        for local_id, pages in extra_toc.items():
            target = merge_map.get(local_id) or local_ids.get(local_id)
            if not target:
                continue
            existing = structured_toc.setdefault(target, [])
            for pg in pages:
                j = _same_page_index(existing, pg)
                if j is None:
                    existing.append(pg)
                elif pg.get("verified") or not existing[j].get("verified"):
                    # same page photographed again in a later batch: the later (upright / Fable-verified)
                    # capture replaces the earlier read instead of duplicating it
                    existing[j] = pg

    out_books = []
    for b in books:
        bid = b["book_id"]
        tr = i18n.get(bid, {})
        book_sources = sources_by_book.get(bid, [])
        supports_en = {s["url"]: s["supports_en"] for s in tr.get("sources_en", [])}
        for s in book_sources:
            s["supports"] = supports_en.get(s["url"], s["supports"])
        out_books.append(
            {
                "id": bid,
                "title": b.get("title", ""),
                "subtitle": b.get("subtitle", ""),
                "volume": b.get("volume", ""),
                "authors": b.get("authors", ""),
                "editors": b.get("editors", ""),
                "publisher": b.get("publisher", ""),
                "year": b.get("display_year") or b.get("printing_year") or "",
                "first_pub_year": b.get("first_pub_year", ""),
                "edition": b.get("edition_statement", ""),
                "isbn": b.get("isbn", ""),
                "language": b.get("language", ""),
                "knowledge_type": tr.get("knowledge_type_en") or b.get("knowledge_type", ""),
                "topics": [TOPIC_EN.get(t, t) for t in b.get("topics", [])],
                "summary": tr.get("summary_en") or b.get("summary", ""),
                "best_for": tr.get("best_for_en") or b.get("best_for", ""),
                "importance": b.get("importance_score", 0),
                "currency_risk": b.get("currency_risk", 0),
                "currentness_note": tr.get("currentness_note_en") or b.get("currentness_note", ""),
                "better_source": tr.get("better_source_en") or b.get("latest_or_better_source", ""),
                "location": shelf_location(b.get("physical_location", "")),
                "photo_count": b.get("photo_count", 0),
                "ref_value": b.get("reference_value_100", 0),
                "toc": toc_by_book.get(bid, []),
                "contents": structured_toc.get(bid, []),
                "sources": book_sources,
            }
        )

    out_books.sort(key=lambda x: (-(x["ref_value"] or 0), x["id"]))

    out_topics = [
        {
            "name": TOPIC_EN.get(t["name"], t["name"]),
            "parent": TOPIC_EN.get(t.get("parent", ""), t.get("parent", "")),
            "synonyms": t.get("synonyms", ""),
        }
        for t in topics
    ]

    return {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "stats": {
            "books": len(out_books),
            "works": len({b.get("work_id") for b in books}),
            "toc_pages": sum(len(b["contents"]) for b in out_books),
            "topics": len(out_topics),
        },
        "topics": out_topics,
        "books": out_books,
    }


# ------------------------------------------------------------------ posts ---

FRONT_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)


def parse_frontmatter(raw: str) -> tuple[dict, str]:
    match = FRONT_RE.match(raw)
    meta: dict[str, str] = {}
    body = raw
    if match:
        for line in match.group(1).splitlines():
            if ":" in line:
                key, _, value = line.partition(":")
                meta[key.strip()] = value.strip()
        body = raw[match.end():]
    return meta, body


def md_inline(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2" target="_blank" rel="noopener">\1</a>',
        text,
    )
    return text


def md_to_html(md: str) -> str:
    lines = md.splitlines()
    html: list[str] = []
    para: list[str] = []
    list_mode = None  # None | 'ul' | 'ol'

    def flush_para():
        if para:
            html.append("<p>" + md_inline(" ".join(para)) + "</p>")
            para.clear()

    def close_list():
        nonlocal list_mode
        if list_mode:
            html.append(f"</{list_mode}>")
            list_mode = None

    in_code = False
    code_lines: list[str] = []

    def flush_code():
        nonlocal in_code
        escaped = "\n".join(code_lines).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        html.append("<pre><code>" + escaped + "</code></pre>")
        code_lines.clear()
        in_code = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):  # fenced code block: verbatim, no inline markdown
            flush_para()
            close_list()
            if in_code:
                flush_code()
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if not stripped:
            flush_para()
            close_list()
            continue
        heading = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if heading:
            flush_para()
            close_list()
            level = len(heading.group(1)) + 1  # h2..h5, h1 reserved for title
            html.append(f"<h{level}>{md_inline(heading.group(2))}</h{level}>")
            continue
        if stripped in ("---", "***"):
            flush_para()
            close_list()
            html.append("<hr>")
            continue
        if stripped.startswith(">"):
            flush_para()
            close_list()
            html.append("<blockquote><p>" + md_inline(stripped.lstrip("> ")) + "</p></blockquote>")
            continue
        bullet = re.match(r"^[-*]\s+(.*)$", stripped)
        if bullet:
            flush_para()
            if list_mode != "ul":
                close_list()
                html.append("<ul>")
                list_mode = "ul"
            html.append("<li>" + md_inline(bullet.group(1)) + "</li>")
            continue
        ordered = re.match(r"^\d+[.)]\s+(.*)$", stripped)
        if ordered:
            flush_para()
            if list_mode != "ol":
                close_list()
                html.append("<ol>")
                list_mode = "ol"
            html.append("<li>" + md_inline(ordered.group(1)) + "</li>")
            continue
        para.append(stripped)

    flush_para()
    close_list()
    if in_code:
        flush_code()
    return "\n".join(html)


def build_posts() -> list[dict]:
    posts = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(raw)
        slug = path.stem
        posts.append(
            {
                "id": slug,
                "title": meta.get("title", slug),
                "date": meta.get("date", ""),
                "category": meta.get("category", "杂记"),
                "summary": meta.get("summary", ""),
                "draft": meta.get("draft", "").lower() == "true",
                "html": md_to_html(body),
            }
        )
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


# ------------------------------------------------------------------- main ---

def write_js(path: Path, var: str, payload) -> None:
    text = json.dumps(payload, ensure_ascii=False)
    text = text.replace("</", "<\\/")
    path.write_text(f"window.{var} = {text};\n", encoding="utf-8")


def main() -> None:
    DATA_OUT.mkdir(exist_ok=True)
    library = build_library()
    posts = build_posts()
    write_js(DATA_OUT / "books.js", "LIBRARY", library)
    write_js(DATA_OUT / "posts.js", "POSTS", posts)
    print(f"books: {library['stats']['books']}, toc_pages: {library['stats']['toc_pages']}, posts: {len(posts)}")
    print("wrote data/books.js and data/posts.js")


if __name__ == "__main__":
    main()
