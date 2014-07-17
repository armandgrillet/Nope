var websitesNoped; // Webistes bloked by Nope.
var nopeIsActivated;
var tabs = {}; // Tabs and url.

/* Functions. */
function updateContextMenu () {
    /* Check variables. */
    if (websitesNoped == undefined) {
        chrome.storage.sync.get("websitesNoped", function(nopeSync) {
            websitesNoped = nopeSync.websitesNoped;
        });
    }

    if (nopeIsActivated == undefined) {
        chrome.storage.sync.get("nopeIsActivated", function(nopeSync) {
            nopeIsActivated = nopeSync.nopeIsActivated;
        });
    }

    /* Update context menu. */

}

/* Chrome events. */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        tabs[sender.tab.id] = request.url;
        if (nopeIsActivated && websitesNoped.indexOf(request.url) > -1) {
            sendResponse({nopeIt: true});
        } else {
            sendResponse({nopeIt: false});
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
        "title": "Refresh this webpage to Nope it!",
        "id": "nope"
    });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Update contextMenu
    updateContextMenu();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    // update contextMenu
    if (changeInfo.status == "loading") {
        updateContextMenu();
    }
});
