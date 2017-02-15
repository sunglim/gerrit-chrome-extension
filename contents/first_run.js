// MIT license

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.storage.local.get("changes", function(items) {
    updateIcon(items.changes);
  });

  fetchChanges();
  chrome.alarms.create('refresh', {periodInMinutes: 0.2});
  chrome.browserAction.setBadgeBackgroundColor({color: "#000"});
});
