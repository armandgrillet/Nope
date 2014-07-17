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
}

function removeNopeForWebsite(tab) {
    console.log(tab);
}

function nopeNewWebsite(info, tab) {
    console.log("meu");
    console.log(tab);
}

/* Chrome events. */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        tabs[sender.tab.id] = request.url;
        if (websitesNoped.indexOf(request.url) > -1) {
            if (nopeIsActivated) {
                sendResponse({nopeIt: true});
            } else {
                sendResponse({nopeIt: false});
            }
            chrome.contextMenus.update("nope", {
                "enabled": true,
                "onclick": function (info, tab) {
                    console.log(info);
                    console.log(tab);
                },
                "title": "Remove Nope for this website"
            });
        } else {
            sendResponse({nopeIt: false});
            chrome.contextMenus.update("nope", {
                "enabled": true,
                "onclick": function (info, tab) {
                    console.log(info);
                    console.log(tab);
                },
                "title": "Nope this website"
            });
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
        "enabled": false,
        "id": "nope",
        "onclick": function (info, tab) {},
        "title": "Reload this webpage to Nope it!"
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
