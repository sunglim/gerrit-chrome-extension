// Saves options to localStorage.
function save_options() {
  try {
    localStorage["api_endpoint"] = document.getElementById("api_endpoint").value.replace(/\/*$/, '');
    chrome.runtime.reload();
  } catch (e) {
  }
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  document.getElementById("api_endpoint").value = localStorage["api_endpoint"];
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
