// MIT license.

// Subscribing fetching gerrit changes.
chrome.alarms.onAlarm.addListener(function (alarm) {
  fetchChanges();
});

function intersect(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}

// Fetch data from gerrit server. |updated_id| is missing, then fetch every item
function fetchChanges(update_id) {
  // Change badge background color red.
  chrome.browserAction.setBadgeBackgroundColor({ color: "#F00" });
  
  var query = ["status:open", "(reviewer:self OR owner:self)"].join('+');
  var gerrit_instance = new GerritQuery();
  gerrit_instance.getChangeList(query)
    .then(function(result) {
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

function getMessagesById(full_output, id) {
  var messages = [];
  full_output.forEach(function(item) {
    if (item.id === id) {
      messages = item.messages;
    }
    return item.id === id;
  });
  return messages;
}

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
      var new_id_list = [];

      storageChange.newValue.forEach(function(item) {
        new_id_list.push(item.id);
      });
      var old_id_list = [];
      storageChange.oldValue.forEach(function(item) {
        old_id_list.push(item.id);
      });
      var intersect_list = intersect(new_id_list, old_id_list);
      intersect_list.forEach(function(item) {
        var new_messages = getMessagesById(storageChange.newValue, item);
        var old_messages = getMessagesById(storageChange.oldValue, item);
        var diff_size = (new_messages.length - old_messages.length);

        for (j = 1; j <= diff_size; j++) {
          var new_msg = new_messages[old_messages.length + j - 1].message;
          var gerrit_instance = new GerritQuery();
          var account_id = new_messages[old_messages.length + j - 1].author._account_id;
          gerrit_instance.getChangeList(item.toString())
            .then(function(result) {
              if (result.length == 1) {
                if (localStorage["checkbot"] == "true" && account_id == 2254) // Checkbot
                  return;
                if (localStorage["build_linux_all"] == "true" && (account_id == 3505 || account_id == 4470 || account_id == 3000 || account_id == 4479 || account_id == 4480 || account_id == 4471 || account_id == 4481 || account_id == 3311 || account_id == 3076 || account_id == 1203 || account_id == 2813 || account_id == 3074 || account_id == 3073))  // BuildLinuxGcc5Happy, BuildLinuxGcc5Happy, BuildLInuxClangAddrSanHappy, BuildLinuxRel, Linux32Rel, BuildLinuxSP3GCC48Happy
                  return;
                if (localStorage["build_sun_all"] == "true" && (account_id == 3689 || account_id == 3691))  // Sun64Rel
                  return;
                if (localStorage["build_windows_all"] == "true" && (account_id == 3311|| account_id == 439 || account_id == 337 || account_id == 2809))  // BuildWIndowsVC2015HappyDbg, BuildWindowsDbg, BuildWindows, BuildWindows32Rel
                  return;
                if (localStorage["build_mac_all"] == "true" && account_id == 2546)
                  return;

                new_msg = new_msg.replace(/(\n\n)/gm,"\n");
                var duration_ms = localStorage["duration"]
                  if (duration_ms === null)
                    duration_ms = 3;
                duration_ms = duration_ms * 1000;
                chrome.notifications.create(result[0]._number.toString(), {title: result[0].subject, iconUrl: './images/icon.png', message: new_msg, type:  'basic', eventTime: Date.now() + duration_ms});
              }
            }, function(e) {
              console.log("failed to fetch changes:", e.message);
            });
        }
      });
    }
  }
});

chrome.notifications.onClicked.addListener(function(id) {
  chrome.notifications.clear(id);
  var BASE_URL = localStorage["api_endpoint"];
  chrome.tabs.create({url: BASE_URL + "/" + id});
});

chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});

chrome.webNavigation.onCommitted.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});
