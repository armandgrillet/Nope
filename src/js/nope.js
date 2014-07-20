chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    window.location.href = chrome.extension.getURL("nope.html?url=" + window.location.href);
});
