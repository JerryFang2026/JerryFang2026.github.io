// 在新标签页打开链接 —— 自用。
//
// 行为：普通左键点击 http/https 链接 → 在新标签页打开，当前页不动。
// 不读取页面内容，不联网。唯一保存的数据：你在哪些网站上把它关掉了（存在本机 chrome.storage.local）。
//
// v1.1：为了不弄坏登录 / 授权这类流程，加了五道保险：
//   1. manifest.json 的 exclude_matches 里列出的网站和路径，这段脚本根本不会被注入；
//   2. 链接地址里带 login / oauth / authorize / session 等字样的，不动；
//   3. 带 data-method / data-turbo / role="button" 等"由网站脚本接管"标记的链接，不动；
//   4. 监听挂在 window 上、页面加载完成后才注册，让网站自己的点击处理先跑；
//      网站已经处理过的点击（preventDefault）不动；
//   5. 点工具栏图标可在当前网站上一键关闭（图标显示 OFF），再点恢复。

(() => {
  'use strict';

  const hasChrome = typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.runtime;
  const STORAGE_KEY = 'disabledHosts';
  const host = location.hostname;
  let enabled = true;

  // ---------- 本站开 / 关 ----------
  function announce() {
    if (hasChrome) chrome.runtime.sendMessage({ type: 'state', enabled }).catch(() => {});
  }
  if (hasChrome) {
    chrome.storage.local.get(STORAGE_KEY).then((r) => {
      enabled = !(r[STORAGE_KEY] || []).includes(host);
      announce();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[STORAGE_KEY]) {
        enabled = !(changes[STORAGE_KEY].newValue || []).includes(host);
        announce();
      }
    });
    // 后台脚本在你点工具栏图标时发来 toggle
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (!msg || msg.type !== 'toggle') return;
      chrome.storage.local.get(STORAGE_KEY).then((r) => {
        const list = r[STORAGE_KEY] || [];
        const i = list.indexOf(host);
        if (i >= 0) list.splice(i, 1); else list.push(host);
        enabled = i >= 0;
        return chrome.storage.local.set({ [STORAGE_KEY]: list });
      }).then(() => sendResponse({ enabled }));
      return true; // 异步回复
    });
  }

  // ---------- 判断规则 ----------
  // 登录、登出、授权、会话、回调、验证……这类地址一律不碰
  const AUTH_PATH = /(^|\/)(login|logout|log[-_]?in|log[-_]?out|signin|signout|sign[-_]?in|sign[-_]?out|sessions?|oauth2?|authorize|auth|sso|saml|callback|consent|two[-_]?factor|2fa|mfa|verify|verification|passkey|webauthn|password|account\/recover)(\/|$)/i;
  // 网站脚本接管的链接标记（Rails / Turbo / PJAX 等）
  const JS_HANDLED = 'a[data-method], a[data-remote], a[data-turbo], a[data-turbo-method], a[data-turbo-frame], a[data-pjax], a[data-ajax], a[role="button"], a[role="menuitem"], a[role="tab"], a[role="option"], a[aria-haspopup]';

  // 从点击位置向上找最近的 <a> 链接（含 Shadow DOM 里的）
  function findLink(event) {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLAnchorElement && node.href) return node;
    }
    return null;
  }

  function shouldOpenInNewTab(a) {
    let url;
    try { url = new URL(a.href); } catch { return false; }

    // 只处理 http/https；跳过 javascript:、mailto:、tel: 等
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // 下载链接保持原样
    if (a.hasAttribute('download')) return false;
    // 本来就是新标签页打开的，不用管
    if (a.target === '_blank') return false;
    // 由网站脚本接管的链接，不动
    if (a.matches(JS_HANDLED)) return false;
    // 链接指向登录类地址，或当前页本身就是登录类页面，不动
    if (AUTH_PATH.test(url.pathname) || AUTH_PATH.test(location.pathname)) return false;
    // 同一页面内的锚点跳转（只是 #hash 不同）保持原样
    const samePage =
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.search === location.search;
    const hrefAttr = a.getAttribute('href') || '';
    if (samePage && (url.hash || hrefAttr.startsWith('#'))) return false;

    return true;
  }

  // 挂在 window 上：网站挂在元素或 document 上的处理先跑，我们最后看
  window.addEventListener('click', (event) => {
    if (!enabled) return;
    // 只处理普通左键；按着 Ctrl / Shift / Alt 时保留 Chrome 默认行为
    if (event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    // 网站自己已经处理了这次点击（站内跳转、弹窗、表单提交……），不干预
    if (event.defaultPrevented) return;

    const a = findLink(event);
    if (!a || !shouldOpenInNewTab(a)) return;

    // 让浏览器自己在新标签页打开（Chrome 对 _blank 自动加 noopener，新页面拿不到当前页）
    const prevTarget = a.getAttribute('target');
    a.target = '_blank';
    // 浏览器完成本次跳转后，把链接恢复原样
    setTimeout(() => {
      if (prevTarget === null) a.removeAttribute('target');
      else a.setAttribute('target', prevTarget);
    }, 0);
  });
})();
