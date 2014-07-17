var websitesNoped; // Webistes bloked by Nope.
var nopeIsActivated;
var tabs = {}; // Tabs and url.

/* Functions. */
function updateContextMenu () {

}

/* Chrome events */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        tabs[sender.tab] = request.url;
        if (websitesNoped == undefined) {
            chrome.storage.sync.get("websitesNoped", function(nopeSync) {
                websitesNoped = nopeSync.websitesNoped;
                if (websitesNoped.indexOf(request.url) > -1) {
                    sendResponse({websiteIsNoped: true});
                } else {
                    sendResponse({websiteIsNoped: false});
                }
            });
        } else {
            if (websitesNoped.indexOf(request.url) > -1) {
                sendResponse({websiteIsNoped: true});
            } else {
                sendResponse({websiteIsNoped: false});
            }
        }
    });

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
        if (nopeSync.websitesNoped == undefined) {
            chrome.storage.sync.set({"websitesNoped": []});
        }
        if (nopeSync.nopeIsActivated == undefined) {
            chrome.storage.sync.set({"nopeIsActivated": true});
        }
    });
    chrome.contextMenus.create({
        "title": "Nope",
        "type": "checkbox",
        "id": "nope"
    });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Update contextMenu
    updateContextMenu();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    // update contextMenu
    console.log(tabId);
    if (changeInfo.status == "loading") {
        updateContextMenu();
    }
});
