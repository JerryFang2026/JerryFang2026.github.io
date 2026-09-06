// 后台脚本，只做两件事：
//   (1) 你点工具栏图标时，通知当前页"切换本站开 / 关"；
//   (2) 在图标上显示 OFF。
// 不联网，不读取任何网页内容。

chrome.action.setBadgeBackgroundColor({ color: '#888888' });

function showBadge(tabId, enabled) {
  chrome.action.setBadgeText({ tabId, text: enabled ? '' : 'OFF' }).catch(() => {});
}

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { type: 'toggle' })
    .then((r) => { if (r) showBadge(tab.id, r.enabled); })
    .catch(() => {}); // 这个页面上没有脚本（被排除的网站或 chrome:// 页面），忽略
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === 'state' && sender.tab) showBadge(sender.tab.id, msg.enabled);
});
