# Open links in a new tab · 在新标签页打开链接

A three-file Chrome extension: a plain left click on an ordinary link opens it in a new tab and leaves the current page where it is. No network access, no page reading, no data collection. Written to be read in full before it is installed.

三个文件的 Chrome 扩展：普通左键点击链接时在新标签页打开，当前页不动。不联网，不读取页面内容，不收集数据。写它的目的就是让你装之前能把代码全部读完。

Story and design notes: [The extension that broke my GitHub login](https://jerryfang2026.github.io/post.html?id=2026-09-06-the-extension-that-broke-my-github-login).

## Install · 安装

1. Download the three files into a folder (or clone this repository and use `extensions/open-in-new-tab`).
2. Open `chrome://extensions`, switch on **Developer mode** (top right).
3. Click **Load unpacked** and choose the folder.

1. 把三个文件放进一个文件夹（或克隆本仓库，用 `extensions/open-in-new-tab`）。
2. 打开 `chrome://extensions`，右上角打开**开发者模式**。
3. 点**加载已解压的扩展程序**，选那个文件夹。

Chrome will show the usual *read and change all your data on all websites* warning: the script has to run on every page to see your clicks. On Windows, Chrome also reminds you at every start that a developer-mode extension is loaded; click Cancel. Both are the price of an extension that never updates itself.

## Files · 文件

| File | Lines | Job |
|---|---|---|
| `manifest.json` | ~40 | Where the script runs, and the list of login / payment sites where it never runs |
| `content.js` | ~100 | The click handler and the rules for leaving a link alone |
| `background.js` | 15 | The toolbar button: switch off for the current site, show an OFF badge |

## Behaviour · 行为

- Only a plain left click counts. Ctrl / Shift / Alt / middle-click keep Chrome's own behaviour.
- Left alone: in-page anchors, `javascript:` / `mailto:` links, downloads, links already targeting a new tab, links a site has marked as script-driven (`data-method`, `data-turbo`, `role="button"` …), any link or page whose path looks like login / logout / oauth / session / callback.
- Never injected on: GitHub, Google / Microsoft / Apple account pages, PayPal, Okta, Auth0, and any path starting with `/login`, `/signin`, `/oauth`, `/auth/`, `/session`, `/sso`, `/saml`. Edit `exclude_matches` in `manifest.json` to add your bank, then click the reload icon on `chrome://extensions`.
- If the site has already handled the click (`preventDefault`), the extension stands down.
- Toolbar button: click once to switch off on the current site (badge shows OFF), click again to restore. The list of switched-off hosts is the only thing it stores, locally.

Not covered: the bookmarks bar, the address bar, and sites that navigate in script (YouTube, X). Ctrl-click, middle-click and Alt+Enter do those.

## License

MIT — see `LICENSE`.
