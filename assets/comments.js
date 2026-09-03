/* Comments: Giscus (GitHub Discussions) + optional Waline (anonymous, email only).
   Fill in the IDs below once the services are set up. Leave a value empty to
   hide that provider. */
window.COMMENTS = {
  giscus: {
    repo: "JerryFang2026/JerryFang2026.github.io",
    repoId: "R_kgDOUKI_Yw",
    category: "Announcements",
    categoryId: "DIC_kwDOUKI_Y84DEyA7",
    lang: "en",
  },
  waline: {
    serverURL: "",
    lang: "en",
  },
};

function currentTheme() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/* Giscus loads inside an iframe; theme changes are pushed to it via postMessage. */
function mountGiscus(container, term) {
  const c = COMMENTS.giscus;
  if (!c.repoId || !c.categoryId) return false;
  const s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.async = true;
  s.crossOrigin = "anonymous";
  const attrs = {
    "data-repo": c.repo,
    "data-repo-id": c.repoId,
    "data-category": c.category,
    "data-category-id": c.categoryId,
    "data-mapping": "specific",
    "data-term": term,
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": currentTheme(),
    "data-lang": c.lang,
    "data-loading": "lazy",
  };
  for (const k in attrs) s.setAttribute(k, attrs[k]);
  container.appendChild(s);

  new MutationObserver(() => {
    const frame = document.querySelector("iframe.giscus-frame");
    if (frame) frame.contentWindow.postMessage({ giscus: { setConfig: { theme: currentTheme() } } }, "https://giscus.app");
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return true;
}

function mountWaline(container, path) {
  const w = COMMENTS.waline;
  if (!w.serverURL) return false;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "https://unpkg.com/@waline/client@v3/dist/waline.css";
  document.head.appendChild(css);
  const s = document.createElement("script");
  s.type = "module";
  s.textContent =
    "import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';" +
    "init({ el: '#waline', serverURL: " + JSON.stringify(w.serverURL) +
    ", path: " + JSON.stringify(path) + ", lang: " + JSON.stringify(w.lang) +
    ", dark: 'html[data-theme=\"dark\"]', emoji: [], login: 'disable', requiredMeta: ['nick', 'mail'] });";
  const el = document.createElement("div");
  el.id = "waline";
  container.appendChild(el);
  container.appendChild(s);
  return true;
}

/* term: stable id for the page ("post:<slug>" or "guestbook"). */
function mountComments(term, heading) {
  const host = document.getElementById("comments");
  if (!host) return;
  const parts = [];
  const g = document.createElement("div");
  g.className = "comments-provider";
  if (mountGiscus(g, term)) parts.push(["Comment with GitHub", g]);
  const w = document.createElement("div");
  w.className = "comments-provider";
  if (mountWaline(w, "/" + term)) parts.push(["Comment with just a name and email", w]);
  if (!parts.length) return;

  host.innerHTML = "<h2>" + (heading || "Comments") + "</h2>";
  for (const [label, el] of parts) {
    if (parts.length > 1) {
      const h = document.createElement("h3");
      h.textContent = label;
      host.appendChild(h);
    }
    host.appendChild(el);
  }
}
