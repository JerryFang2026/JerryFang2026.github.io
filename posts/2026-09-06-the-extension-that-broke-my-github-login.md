---
title: The extension that broke my GitHub login
date: 2026-09-06
category: Toolkit
summary: I wanted every link to open in a new tab, refused to trust a stranger's extension with every page I visit, and had my own written instead. It broke GitHub sign-in the same afternoon. What went wrong, how it was fixed, and the source — the first code I have published.
---

I moved my bookmarks to a new machine this week and wanted one small thing from Chrome: click a link, get a new tab, keep the page I was on. Chrome has no setting for this. The Web Store has a dozen extensions that do it, and every one of them asks for the same permission, *read and change all your data on all websites*, because rewriting links means running on every page, the bank's included.

We compared eleven of them. The best link extension was two kilobytes of clean code from a solo developer: no network calls, no data collection, a reply under every review. I still did not want it. Two kilobytes is easy to read today; the problem is that a Web Store extension updates itself, and small extensions get sold. The version I audited is not the version I would be running next year.

So I had one written. I described the behaviour; Claude Code produced sixty lines; I read every one of them before loading it. An extension loaded unpacked in developer mode never updates. The only way it changes is if someone edits the files on my disk, and if that has happened, the extension is not the thing to worry about.

## What it does

The whole idea fits in a paragraph. Listen for clicks. If it is a plain left click on an ordinary http or https link — no modifier keys, not a download, not an in-page anchor, not already opening in a new tab — set the link's `target` to `_blank` for that one instant, let the browser open the new tab, then put the attribute back.

```
window.addEventListener('click', (event) => {
  if (event.button !== 0) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (event.defaultPrevented) return;   // the site already handled this click
  const a = findLink(event);
  if (!a || !shouldOpenInNewTab(a)) return;
  const prev = a.getAttribute('target');
  a.target = '_blank';
  setTimeout(() => prev === null ? a.removeAttribute('target') : a.setAttribute('target', prev), 0);
});
```

No permissions, no storage, no background script. Version 1.0 already excluded PayPal, because I could see that a payment flow expects to carry on in the same tab.

## What broke

That afternoon GitHub would not let me sign in. Each attempt failed in a way that looked like a wrong password. Remove the extension, and it worked. Three things had gone wrong, and the first was a mistake of mine.

- **It ran first, not last.** The listener sat on `document`, registered the moment the page started loading. GitHub delegates its own click handling to `document` as well, but registers it later, so mine ran first. The line that was supposed to stand down when the site had already handled a click could never see anything, because nothing had run yet.
- **A new tab is amnesiac.** Chrome gives `target="_blank"` an implicit `noopener`: the new page cannot see the one that spawned it. Sign-in and authorisation flows are precisely the pages that carry state from one step to the next — a return address, a one-time code, a popup that reports back to the window that opened it. Break the chain anywhere and the flow ends in an error.
- **The old tab stays put.** A flow that should move forward in one tab instead sprouts a new tab at every step while the original never advances. From the outside that reads as *cannot log in*.

I had thought about this class of page. I had not thought that GitHub's login was the same shape as PayPal's checkout.

## The fix

Version 1.1 adds five layers, in order of bluntness.

1. A hard exclusion list in the manifest: GitHub, the Google, Microsoft and Apple account pages, PayPal, Okta, Auth0, and any path beginning with `/login`, `/signin`, `/oauth`, `/auth/`, `/session`, `/sso` or `/saml`. On those pages the script is never injected at all.
2. Links whose address mentions login, logout, oauth, authorize, session, callback, 2fa, passkey or password are left alone, wherever they appear.
3. Links a site has marked as script-driven — `data-method`, `data-turbo`, `data-pjax`, `role="button"`, `aria-haspopup` — are left alone.
4. The listener moved from `document` to `window` and now registers after the page has loaded, so the site's own handlers run first and the *already handled* check finally means something.
5. A toolbar button that switches the extension off for the current site, with an OFF badge, for the flows I have not thought of yet. That is the one addition with a cost: a `storage` permission to remember the list, and a fifteen-line background script.

The test is a page that fires synthetic clicks at links of every shape and records what the handler did: twenty-four cases, including a document-level handler that cancels the click the way GitHub's does. Version 1.0 fails that case. Version 1.1 passes it, and still opens an ordinary article link in a new tab.

## What I learned

There is no way to be last in the DOM. You can register late and listen high, and after that you have to respect what the page has already decided; a rule that only works when it runs first is not a rule.

A heuristic needs an escape hatch. The exclusion lists are guesses about which pages are fragile. The toolbar button is what happens when the guess is wrong, and it costs one click instead of an afternoon.

And the argument for writing your own survives the bug. Sixty lines I can read, that cannot change behind my back, still beat two kilobytes I cannot audit next month. When the sixty lines were wrong, they were wrong in a way I could find and fix.

## Take it

The source is three files under the [extensions folder of this site's repository](https://github.com/JerryFang2026/JerryFang2026.github.io/tree/main/extensions/open-in-new-tab), MIT licensed. To use it: `chrome://extensions`, switch on developer mode, *Load unpacked*, choose the folder. Windows will remind you at every start that a developer-mode extension is running; that is the price of an extension that cannot update itself. It does nothing for the bookmarks bar, the address bar, or sites that navigate in script such as YouTube and X; Ctrl-click, middle-click and Alt+Enter cover those.

It is the first code I have published. It is small, and it arrived with a bug story attached, which seems like the honest way to start.
