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
		if (item._number === id) {
			messages = item.messages;
		}
		return item._number === id;
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
	  // Uses _number instead of id. to find url for that change.
	  storageChange.newValue.forEach(function(item) {
		  new_id_list.push(item._number);
	  });
	  var old_id_list = [];
	  storageChange.oldValue.forEach(function(item) {
		  old_id_list.push(item._number);
	  });
	  var intersect_list = intersect(new_id_list, old_id_list);
	  intersect_list.forEach(function(item) {
		 var new_messages = getMessagesById(storageChange.newValue, item);
		 var old_messages = getMessagesById(storageChange.oldValue, item);
		 var diff_size = (new_messages.length - old_messages.length);
		 
		 for (j = 1; j <= diff_size; j++) {
			var new_msg = new_messages[old_messages.length + j - 1].message;
			chrome.notifications.create(item.toString(), {title: "New Message", iconUrl: './images/icon.png', message: new_msg, type:  'basic'});
		 }
	  });
    }
  }
});

chrome.notifications.onClicked.addListener(function(id) {
	var BASE_URL = localStorage["api_endpoint"];
    chrome.tabs.create({url: BASE_URL + "/" + id});
});

chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});

chrome.webNavigation.onCommitted.addListener(onNavigate, {
  url: [{ hostSuffix: localStorage["api_endpoint"].split("://").pop() }]
});
