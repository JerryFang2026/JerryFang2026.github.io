"""Generate stable, readable book pages from the existing reviewed catalogue."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PUBLIC = 'https://jerryfang2026.github.io/'
esc = lambda value: html.escape(str(value if value is not None else ''), quote=True)


def section_id(kind, group, index):
    return f'{kind}-{re.sub(r"[^a-zA-Z0-9_-]", "-", str(group))}-{index}'


def toc_html(book):
    stack = []
    def rows(group, kind, key):
        out = []
        for i, entry in enumerate(group['entries']):
            level = int(entry.get('l') or 1)
            while stack and stack[-1]['l'] >= level:
                stack.pop()
            page = entry.get('p')
            parent = next((e for e in reversed(stack) if e.get('p') is not None), None)
            if page is not None:
                label = ('pp. ' if '-' in str(page) else 'p. ') + str(page) + (' ?' if entry.get('u') else '')
            elif parent:
                label = 'Within ' + ('pp. ' if '-' in str(parent['p']) else 'section starting p. ') + str(parent['p']) + (' ?' if parent.get('u') else '')
            else:
                label = 'Page not listed'
            page_html = esc(label)
            if entry.get('p_source'):
                page_html = f'<a href="{esc(entry["p_source"])}" target="_blank" rel="noopener" title="Page verified from this online source">{page_html} ↗</a>'
            anchor = section_id(kind, key, i)
            out.append(f'<div class="book-toc-row level-{level}" id="{anchor}" tabindex="-1" style="--level:{min(level,4)}">'
                       f'<a class="toc-title" href="#{anchor}">{esc(entry["t"])}</a>'
                       f'<span class="page-label">{page_html}</span></div>')
            stack.append({**entry, 'l': level})
        return ''.join(out)
    parts = []
    if book.get('contents'):
        content = ''.join(rows(pg, 'photo', pg['img']) for pg in book['contents'])
        parts.append('<section class="book-toc-group"><h3>Photographed contents</h3>'+content+'</section>')
    for i, group in enumerate(book.get('online_contents', [])):
        parts.append('<section class="book-toc-group"><h3>Contents from online sources</h3>'
                     f'<p><a href="{esc(group["url"])}" target="_blank" rel="noopener">{esc(group["label"])}</a></p>'
                     f'<p class="coverage-note">{esc(group["scope"])}</p>'+rows(group,'online',i)+'</section>')
    if not parts:
        parts.append('<p class="empty-state">A reliable chapter index is not yet available for this copy. The book record and reading sources are still available here.</p>')
    return ''.join(parts)


def page_html(book):
    title = ' — '.join(filter(None,[book['title'],book.get('volume'),book.get('subtitle')]))
    metadata = [('Authors',book.get('authors')),('Editors',book.get('editors')),('Copy year',book.get('year')),
                ('Publisher',book.get('publisher')),('Edition / printing',book.get('edition')),('ISBN',book.get('isbn')),
                ('Location',book.get('location'))]
    details = ''.join(f'<dt>{esc(k)}</dt><dd>{esc(v)}</dd>' for k,v in metadata if v)
    notes = ''.join(f'<p class="coverage-note">{esc(book[k])}</p>' for k in ['catalogue_note','contents_note','supplement_note'] if book.get(k))
    fallback_sources = '<ul>'+''.join(f'<li><a href="{esc(s["url"])}">{esc(s["title"])}</a> — {esc(s["supports"])}</li>' for s in book.get('sources',[]))+'</ul>'
    canonical = PUBLIC+'books/'+book['id']+'.html'
    structured = {'@context':'https://schema.org','@type':'Book','name':title,'url':canonical}
    if re.fullmatch(r'\d{4}',str(book.get('year',''))): structured['datePublished'] = str(book['year'])
    payload = json.dumps(book,ensure_ascii=False).replace('<','\\u003c')
    schema = json.dumps(structured,ensure_ascii=False).replace('<','\\u003c')
    return f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} · Aquifer Notes</title>
<meta name="description" content="{esc((book.get('summary') or 'Bibliographic record and chapter index.')[:220])}">
<link rel="canonical" href="{canonical}"><link rel="stylesheet" href="../assets/style.css">
<script type="application/ld+json">{schema}</script>
</head><body data-page="book">
<header id="site-header" class="site-header"></header>
<main class="wrap book-wrap">
<a id="back-to-results" class="back-link" href="../library.html">← Browse the library</a>
<section class="book-hero" id="overview"><p class="eyebrow">{book['id']} · THE G15 BOOKSHELF</p>
<h1>{esc(title)}</h1><p class="book-lead">{esc(book.get('summary'))}</p>
<p class="best-for"><strong>Best for:</strong> {esc(book.get('best_for'))}</p>
<dl class="book-metadata">{details}</dl>
<nav class="book-nav" aria-label="Book sections"><a href="#contents">Contents</a><a href="#read">Read & find</a><a href="#cite">Cite & share</a><a href="#discuss">Questions & corrections</a></nav>
</section>
<div class="book-layout"><article class="book-primary">
<section id="contents"><h2>Contents & page finder</h2>{notes}
<p class="coverage-note">Numbers refer to printed pages. “?” marks an unchecked photo reading; “↗” links a page verified online. A parent-page hint is not the exact page of the subsection.</p>
<div class="within-search"><label for="within-book">Find a chapter or topic in this book</label><input id="within-book" type="search" placeholder="Search this book’s contents…" maxlength="200"><p id="within-count" role="status"></p></div>
<div id="book-contents">{toc_html(book)}</div></section>
</article><aside class="book-sidebar">
<section class="side-panel" id="read"><h2>Read & find</h2><p class="physical-copy"><strong>Print copy</strong><br>{esc(book.get('location'))}</p><div id="reading-links">{fallback_sources}</div></section>
<section class="side-panel" id="cite"><h2>Cite & share</h2><p id="reference-text" class="reference-text">{esc(title)}</p>
<div class="book-actions"><button class="button" id="copy-reference" type="button">Copy reference</button><button class="button" id="download-csl" type="button">Export for Zotero</button><button class="button" id="download-ris" type="button">Export RIS</button><button class="button" id="copy-book-link" type="button">Copy book link</button></div>
<p class="coverage-note">The reference preserves this copy’s recorded edition and year. “Export for Zotero” uses CSL JSON; RIS is also available for other reference managers.</p><div id="book-action-status" class="action-status" role="status"></div></section>
<section class="side-panel"><h2>Reading context</h2><p>{esc(book.get('currentness_note'))}</p><p>{esc(book.get('better_source'))}</p></section>
</aside></div>
<section class="discussion-prompt" id="discuss"><h2>Questions & corrections</h2><p>Spotted a wrong page or broken link? This discussion belongs to {book['id']}. Include the chapter title when reporting a problem.</p><button class="button" id="show-discussion" type="button">Open discussion for this book</button></section>
<section class="comments" id="comments"></section>
</main><footer id="site-footer" class="site-footer"></footer>
<script>window.SITE_ROOT="../";window.BOOK={payload};</script>
<script src="../data/reading_access.js"></script><script src="../assets/catalogue-core.js"></script><script src="../assets/comments.js"></script><script src="../assets/book.js"></script><script src="../assets/app.js"></script>
</body></html>'''


def write_book_pages(library):
    folder = ROOT / 'books'
    folder.mkdir(exist_ok=True)
    for book in library['books']:
        assert re.fullmatch(r'BK-\d{4}',book['id'])
        (folder/(book['id']+'.html')).write_text(page_html(book),encoding='utf-8')
    urls = [PUBLIC, PUBLIC+'library.html',PUBLIC+'about.html']+[PUBLIC+'books/'+b['id']+'.html' for b in library['books']]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+esc(u)+'</loc></url>' for u in urls)+'</urlset>\n'
    (ROOT/'sitemap.xml').write_text(sitemap,encoding='utf-8')
    print(f'generated {len(library["books"])} individual book pages')
