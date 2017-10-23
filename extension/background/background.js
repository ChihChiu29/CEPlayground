/**
 * @fileoverview Supports the background page.
 */

// Copy text to clipboard. Returns if the action is successful.
function copyText(text /* string */) {
  var textArea = document.querySelector('#copy-area');
  textArea.innerText = text;
  textArea.select();
  return document.execCommand('copy');
}

// Add listeners for copy text request.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msg == 'copyText') {
    sendResponse(copyText(request.text));
  }
});
