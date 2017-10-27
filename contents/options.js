// Saves options to localStorage.
function save_options() {
  try {
    localStorage["api_endpoint"] = document.getElementById("api_endpoint").value.replace(/\/*$/, '');
    localStorage["duration"] = document.getElementById("duration").value;
    localStorage["user_automatic_perforamnce"] = document.getElementById("user_automatic_performance").checked;
    localStorage["build_linux_all"] = document.getElementById("build_linux_all").checked;
    localStorage["build_sun_all"] = document.getElementById("build_sun_all").checked;
    localStorage["build_mac_all"] = document.getElementById("build_mac_all").checked;
    localStorage["build_windows_all"] = document.getElementById("build_windows_all").checked;
    localStorage["checkbot"] = document.getElementById("checkbot").checked;
    localStorage["trex_service"] = document.getElementById("trex_service").checked;
    localStorage["merge_summary"] = document.getElementById("merge_summary").checked;

    chrome.runtime.reload();
  } catch (e) {
  }
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  document.getElementById("api_endpoint").value = localStorage["api_endpoint"];
  var duration = localStorage["duration"];
  if (duration === undefined)
    localStorage["duration"] = 8;
  
  var api_endpoint = localStorage["api_endpoint"];
  if (api_endpoint == undefined || api_endpoint == "undefined")
    localStorage["api_endpoint"] = "https://hdbgerrit.wdf.sap.corp:8443";
  document.getElementById('api_endpoint').value = localStorage["api_endpoint"];

  document.getElementById("duration").value = localStorage["duration"];

  var user_automatic_perforamnce = localStorage["user_automatic_perforamnce"];
  if (user_automatic_perforamnce == undefined)
    localStorage["user_automatic_perforamnce"] = true;
  else {
    console.log("not undefined");
    console.log(user_automatic_perforamnce);
  }
  
  var build_linux_all = localStorage["build_linux_all"];
  if (build_linux_all == undefined)
    localStorage["build_linux_all"] = true;

  var build_sun_all = localStorage["build_sun_all"];
  if (build_sun_all == undefined)
    localStorage["build_sun_all"] = true;

  var build_mac_all = localStorage["build_mac_all"];
  if (build_mac_all == undefined)
    localStorage["build_mac_all"] = true;

  var build_windows_all = localStorage["build_windows_all"];
  if (build_windows_all === undefined)
    localStorage["build_windows_all"] = true;

  var checkbot = localStorage["checkbot"];
  if (checkbot === undefined)
    localStorage["checkbot"] = true;

  var trex_service = localStorage["trex_service"];
  if (trex_service === undefined)
    localStorage["trex_service"] = true;

  var merge_summary = localStorage["merge_summary"];
  if (merge_summary === undefined)
    localStorage["merge_summary"] = true;

  document.getElementById("user_automatic_performance").checked = localStorage["user_automatic_perforamnce"] == "true";
  document.getElementById("build_linux_all").checked = localStorage["build_linux_all"] == "true";
  document.getElementById("build_sun_all").checked = localStorage["build_sun_all"] == "true";
  document.getElementById("build_windows_all").checked = localStorage["build_windows_all"] == "true";
  document.getElementById("build_mac_all").checked = localStorage["build_mac_all"] == "true";
  document.getElementById("checkbot").checked = localStorage["checkbot"] == "true";
  document.getElementById("trex_service").checked = localStorage["trex_service"] == "true";
  document.getElementById("merge_summary").checked = localStorage["merge_summary"] == "true";
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
