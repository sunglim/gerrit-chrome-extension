// MIT license.

// Subscribing fetching gerrit changes.
chrome.alarms.onAlarm.addListener(function (alarm) {
  fetchChanges();
});

// Fetch data from gerrit server. |updated_id| is missing, then fetch every item
function fetchChanges(update_id) {
  // Change badge background color red.
  chrome.browserAction.setBadgeBackgroundColor({ color: "#F00" });

  var query = ["status:open", "(reviewer:self OR owner:self)"].join('+');
  var gerrit_instance = new GerritQuery();
  gerrit_instance.getChangeList(query)
    .then(function(result) {
      console.log("got changes:", result.length);
      chrome.storage.local.set({ 'changes': result });

      if (update_id !== undefined) {
        // update timestamp/read state
        var nike = result.filter(function(o){ return o._number === update_id });
        var pop_item = nike.pop();
        var updated = pop_item.updated;
        chrome.storage.local.get("timestamps", function(items) {
          var timestamps = items.timestamps || {};
          timestamps[update_id] = updated;
          chrome.storage.local.set({ 'timestamps': timestamps });
        });
      }
    }, function(e) {
      console.log("failed to fetch changes:", e.message);
      delete chrome.storage.local.changes;
    });
}

function updateIcon(changes) {
  try {
    var unread = changes.filter(function(value, index, array) {return !value.reviewed});
  } catch (e) {
  }
  chrome.browserAction.setBadgeText({ text: unread && unread.length.toString() || "..." });
}

function onNavigate(details) {
  console.log("onNavigate", details.url);
  try {
    var update_id = parseInt(details.url.match(/#\/c\/(\d+)/)[1]);
    fetchChanges(update_id);
  } catch (e) {
    console.log("Failed to parse id for", details.url);
  }
}

chrome.runtime.onSuspend.addListener(function() {
  chrome.browserAction.setBadgeBackgroundColor({color: "#888"});
});

chrome.runtime.onSuspendCanceled.addListener(function() {
  chrome.browserAction.setBadgeBackgroundColor({color: "#F0F"});
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
    if (key === "changes") {
      updateIcon(storageChange.newValue);
    }
  }
});

chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});

chrome.webNavigation.onCommitted.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});
