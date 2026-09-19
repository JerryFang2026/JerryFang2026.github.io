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
  const base = window.SITE_ROOT || "";
  if (active === "book") active = "library";
  const el = document.getElementById("site-header");
  if (!el) return;
  el.innerHTML =
    '<div class="wrap">' +
    '<div class="brand"><a href="' + base + 'index.html">' + esc(SITE.title) + "</a></div>" +
    '<span class="tagline">' + esc(SITE.tagline) + "</span>" +
    '<nav class="main">' +
    ['<a href="' + base + 'index.html"' + (active === "home" ? ' class="active"' : "") + ">Home</a>",
     '<a href="' + base + 'library.html"' + (active === "library" ? ' class="active"' : "") + ">Library</a>",
     '<a href="' + base + 'about.html"' + (active === "about" ? ' class="active"' : "") + ">About</a>"].join("") +
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
  // Mount the comment widget once; a later re-render (see refreshData) must not add a second copy.
  if (window.mountComments && !renderPost.commentsMounted) {
    renderPost.commentsMounted = true;
    mountComments("post:" + post.id, "Comments");
  }
}

/* ------------------------------------------------------------- freshness */
/* GitHub Pages tells browsers to keep data/*.js for 10 minutes, so a reader who
   opened the site shortly before a new post went up may be shown the old list,
   and a shared link to a brand-new post can land on "Post not found". After the
   first paint we ask the server once more, bypassing the browser cache (a cheap
   conditional request: 304 if nothing changed), and re-render only when the
   data really differs. Any failure is ignored and the page keeps what it has. */
function refreshData(file, varName, onChange) {
  const tag = document.querySelector('script[src$="' + file + '"]');
  if (!tag || !window.fetch) return; // e.g. the single-file artifact build inlines its data
  fetch(tag.getAttribute("src"), { cache: "no-cache" })
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((text) => {
      const start = text.indexOf("=");
      const end = text.lastIndexOf(";");
      if (start < 0 || end < start) return;
      const fresh = JSON.parse(text.slice(start + 1, end));
      if (JSON.stringify(fresh) === JSON.stringify(window[varName])) return;
      window[varName] = fresh;
      onChange();
    })
    .catch(() => {});
}

/* ------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  renderHeader(page);
  renderFooter();
  if (page === "home") {
    renderPostList();
    refreshData("data/posts.js", "POSTS", renderPostList);
  }
  if (page === "post") {
    renderPost();
    refreshData("data/posts.js", "POSTS", renderPost);
  }
  if (page === "library") {
    window.LibraryUI.init();
    refreshData("data/books.js", "LIBRARY", () => window.LibraryUI.render());
  }
  if (page === "book" && window.BookUI) window.BookUI.init();
  if (page === "about" && window.mountComments) mountComments("guestbook", "Guestbook");
});
