/* Site-wide config: change the name/tagline here (and in each page's <title>). */
window.SITE = {
  title: "Aquifer Notes",
  tagline: "Hydrogeology essays & a searchable index of the professional bookshelf",
  author: "Jerry",
};

/* ------------------------------------------------------------- helpers */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text, terms) {
  let out = esc(text);
  for (const t of terms) {
    if (!t) continue;
    const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, (m) => "\u0001" + m + "\u0002");
  }
  return out.replace(/\u0001/g, "<mark>").replace(/\u0002/g, "</mark>");
}

/* ------------------------------------------------------------- theme */
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved === "dark" || saved === "light") {
    document.documentElement.setAttribute("data-theme", saved);
  }
})();

function toggleTheme() {
  const root = document.documentElement;
  const isDark =
    root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
}

/* ------------------------------------------------------------- header */
function renderHeader(active) {
  const el = document.getElementById("site-header");
  if (!el) return;
  el.innerHTML =
    '<div class="wrap">' +
    '<div class="brand"><a href="index.html">' + esc(SITE.title) + "</a></div>" +
    '<span class="tagline">' + esc(SITE.tagline) + "</span>" +
    '<nav class="main">' +
    ['<a href="index.html"' + (active === "home" ? ' class="active"' : "") + ">Home</a>",
     '<a href="library.html"' + (active === "library" ? ' class="active"' : "") + ">Library</a>",
     '<a href="about.html"' + (active === "about" ? ' class="active"' : "") + ">About</a>"].join("") +
    '<button id="theme-toggle" title="Toggle light/dark">☀︎ / ☾</button>' +
    "</nav></div>";
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML =
    '<div class="wrap">© ' + new Date().getFullYear() + " " + esc(SITE.author) +
    " · " + esc(SITE.title) + " · a personal study index</div>";
}

/* ------------------------------------------------------------- blog */
function renderPostList() {
  const el = document.getElementById("post-list");
  if (!el || !window.POSTS) return;
  el.innerHTML = POSTS.filter((p) => !p.draft)
    .map(
      (p) =>
        '<div class="post-item">' +
        '<div class="meta"><span class="chip">' + esc(p.category) + "</span>" + esc(p.date) + "</div>" +
        '<h2><a href="post.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.title) + "</a></h2>" +
        '<div class="summary">' + esc(p.summary) + "</div>" +
        '<a class="more" href="post.html?id=' + encodeURIComponent(p.id) + '">Read more →</a>' +
        "</div>"
    )
    .join("");
}

function renderPost() {
  const el = document.getElementById("post-body");
  if (!el || !window.POSTS) return;
  const id = new URLSearchParams(location.search).get("id");
  const post = POSTS.find((p) => p.id === id);
  if (!post) {
    el.innerHTML = "<h1>Post not found</h1><p><a href='index.html'>← Back to home</a></p>";
    return;
  }
  document.title = post.title + " · " + SITE.title;
  el.innerHTML =
    "<h1>" + esc(post.title) + "</h1>" +
    '<div class="meta"><span class="chip">' + esc(post.category) + "</span>" + esc(post.date) + "</div>" +
    post.html;
}

/* ------------------------------------------------------------- library */
const libState = { q: "", topic: null };

function bookMatches(b, terms) {
  if (!terms.length) return true;
  const hay = [
    b.title, b.subtitle, b.volume, b.authors, b.editors, b.publisher,
    b.knowledge_type, b.summary, b.best_for, b.better_source, b.isbn,
    (b.topics || []).join(" "), (b.toc || []).join(" "),
    flatContents(b).map((e) => e.t).join(" "),
  ].join(" \n ").toLowerCase();
  return terms.every((t) => hay.includes(t));
}

function flatContents(b) {
  return (b.contents || []).flatMap((pg) => pg.entries);
}

function contentHits(b, terms) {
  if (!terms.length) return [];
  return flatContents(b).filter((e) => {
    const t = e.t.toLowerCase();
    return terms.some((x) => t.includes(x));
  });
}

function tocRows(list, terms) {
  return list
    .map(
      (e) =>
        '<div class="row l' + (e.l || 1) + '"><span class="t">' + highlight(e.t, terms) +
        '</span><span class="leader"></span><span class="pg">' + (e.p == null ? "" : esc(e.p)) + "</span></div>"
    )
    .join("");
}

function riskLabel(n) {
  return n >= 5 ? "currency risk: high" : n >= 4 ? "currency risk: elevated" : n >= 3 ? "currency risk: moderate" : "currency risk: low";
}

function renderBook(b, terms) {
  const by = [b.authors, b.editors ? "eds. " + b.editors : ""].filter(Boolean).join(" · ");
  const stars = "★".repeat(b.importance || 0) + "☆".repeat(Math.max(0, 5 - (b.importance || 0)));
  const tocText = (b.toc || []).join("\n\n");
  const flat = flatContents(b);
  const hits = contentHits(b, terms);
  const hitsHTML = hits.length
    ? '<div class="hits"><b>' + hits.length + " matching section" + (hits.length > 1 ? "s" : "") + ":</b>" +
      tocRows(hits.slice(0, 6), terms) +
      (hits.length > 6 ? '<div class="morehits">…and ' + (hits.length - 6) + " more in the full contents below</div>" : "") +
      "</div>"
    : "";
  return (
    '<div class="book" data-id="' + b.id + '">' +
    '<div class="row1"><h3>' + highlight(b.title, terms) +
    (b.volume ? ' <span class="vol">' + esc(b.volume) + "</span>" : "") +
    (b.subtitle ? ' <span class="vol">— ' + esc(b.subtitle) + "</span>" : "") +
    '</h3><span class="year">' + esc(b.year) + " · " + esc(b.publisher) + "</span></div>" +
    '<div class="byline">' + highlight(by, terms) + "</div>" +
    '<div class="badges">' +
    (b.topics || []).map((t) => '<span class="badge">' + esc(t) + "</span>").join("") +
    '<span class="badge risk">' + riskLabel(b.currency_risk) + "</span>" +
    '<span class="badge loc">' + esc(b.location) + "</span>" +
    "</div>" +
    '<div class="bestfor"><b>Best for:</b> ' + highlight(b.best_for, terms) + "</div>" +
    hitsHTML +
    '<div class="detail">' +
    "<p>" + highlight(b.summary, terms) + "</p>" +
    "<dl>" +
    "<dt>Importance</dt><dd>" + stars + "</dd>" +
    "<dt>Type</dt><dd>" + esc(b.knowledge_type) + "</dd>" +
    "<dt>Edition</dt><dd>" + esc(b.edition) + (b.first_pub_year ? " (first published " + b.first_pub_year + ")" : "") + "</dd>" +
    (b.isbn ? "<dt>ISBN</dt><dd>" + esc(b.isbn) + "</dd>" : "") +
    "<dt>Location</dt><dd>" + esc(b.location) + "</dd>" +
    "</dl>" +
    (b.currentness_note ? '<div class="note">⚠ ' + esc(b.currentness_note) + "</div>" : "") +
    (b.better_source ? "<p><b>Newer / better edition:</b> " + esc(b.better_source) + "</p>" : "") +
    ((b.sources || []).length
      ? "<p><b>Links:</b></p><ul class='srcs'>" +
        b.sources.map((s) => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a> — " + esc(s.supports) + "</li>").join("") +
        "</ul>"
      : "") +
    (flat.length
      ? "<p><b>Contents (from the photographed pages):</b></p>" +
        '<div class="toc-list">' + tocRows(flat, terms) + "</div>"
      : tocText
      ? '<div class="toc-box">' + highlight(tocText, terms) + "</div>" +
        '<a class="toc-more">Show full contents ▾</a>'
      : "") +
    "</div></div>"
  );
}

function renderLibrary() {
  const listEl = document.getElementById("book-list");
  const noteEl = document.getElementById("result-note");
  if (!listEl || !window.LIBRARY) return;
  const terms = libState.q.toLowerCase().split(/\s+/).filter(Boolean);
  let books = LIBRARY.books.filter((b) => bookMatches(b, terms));
  if (libState.topic) books = books.filter((b) => (b.topics || []).includes(libState.topic));
  if (terms.length)
    books = books.slice().sort((a, b2) => contentHits(b2, terms).length - contentHits(a, terms).length);
  noteEl.textContent =
    books.length + (books.length === 1 ? " book" : " books") +
    (terms.length || libState.topic ? " (of " + LIBRARY.books.length + ")" : "") +
    " · sorted by reference value · click an entry for details";
  listEl.innerHTML = books.map((b) => renderBook(b, terms)).join("") ||
    "<p style='color:var(--ink-faint);padding:20px 4px'>No matches. Try another keyword — search covers titles, authors, topics, summaries and the full text of every contents page.</p>";
}

function initLibrary() {
  const q = document.getElementById("q");
  const chipsEl = document.getElementById("topic-chips");
  const statsEl = document.getElementById("stats");
  if (!q || !window.LIBRARY) return;

  const s = LIBRARY.stats;
  statsEl.innerHTML = [
    ["physical books", s.books], ["title families", s.works],
    ["contents pages", s.toc_pages], ["topics", s.topics],
  ].map(([label, n]) => '<div class="stat"><b>' + n + "</b><span>" + label + "</span></div>").join("");

  const counts = {};
  for (const b of LIBRARY.books) for (const t of b.topics || []) counts[t] = (counts[t] || 0) + 1;
  const topics = LIBRARY.topics
    .map((t) => t.name).filter((t) => counts[t])
    .sort((a, b2) => counts[b2] - counts[a]);
  chipsEl.innerHTML = topics
    .map((t) => '<button data-topic="' + esc(t) + '">' + esc(t) + " " + counts[t] + "</button>")
    .join("");
  chipsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const t = btn.getAttribute("data-topic");
    libState.topic = libState.topic === t ? null : t;
    for (const b of chipsEl.querySelectorAll("button"))
      b.classList.toggle("on", b.getAttribute("data-topic") === libState.topic);
    renderLibrary();
  });

  let timer = null;
  q.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      libState.q = q.value.trim();
      renderLibrary();
    }, 150);
  });

  document.getElementById("book-list").addEventListener("click", (e) => {
    const more = e.target.closest(".toc-more");
    if (more) {
      const box = more.parentElement.querySelector(".toc-box");
      box.classList.toggle("full");
      more.textContent = box.classList.contains("full") ? "Collapse contents ▴" : "Show full contents ▾";
      e.stopPropagation();
      return;
    }
    if (e.target.closest("a")) return;
    const card = e.target.closest(".book");
    if (card) card.classList.toggle("open");
  });

  renderLibrary();
}

/* ------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  renderHeader(page);
  renderFooter();
  if (page === "home") renderPostList();
  if (page === "post") renderPost();
  if (page === "library") initLibrary();
});
