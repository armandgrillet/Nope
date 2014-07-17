var websitesNoped; // Webistes bloked by Nope.
var nopeIsActivated;
var tabs = {}; // Tabs and url.

/* Functions. */
function addNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            addNopeForWebsite(tab.id);
        },
        "title": "Add Nope for this website"
    });
}

function addNopeForWebsite (tabId) {
    var tabUrl = tabs[tabId];
    if (websitesNoped.indexOf(tabUrl) == -1) { // We add the website to the nopedWebsites;
        websitesNoped.push(tabUrl);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }
    for (tab in tabs) {
        if (tabs[tab] == tabUrl) {
            chrome.tabs.reload(parseInt(tab));
        }
    }
}

function nopeIsNotReady () {
    chrome.contextMenus.update("nope", {
        "enabled": false,
        "onclick": function (info, tab) {},
        "title": "Reload this webpage to Nope it!"
    });
}

function checkNope (tabId) {
    /* Check variables. */
    if (websitesNoped == undefined || nopeIsActivated == undefined) {
        chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
            websitesNoped = nopeSync.websitesNoped;
            nopeIsActivated = nopeSync.nopeIsActivated;
            updateContextMenu(tabId);
        });
    } else {
        updateContextMenu(tabId);
    }
}

function updateContextMenu (tabId) {
    if (tabs[tabId] != undefined) { // If the tab has been updated after the installation of Nope.
        if (websitesNoped.indexOf(tabs[tabId]) > -1) {
            removeNopeContextMenu();
        } else {
            addNopeContextMenu();
        }
    } else {
        nopeIsNotReady();
    }
}

function removeNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            removeNopeForWebsite(tab.id)
        },
        "title": "Remove Nope for this website"
    });
}

function removeNopeForWebsite (tabId) {
    var tabUrl = tabs[tabId];
    if (websitesNoped.indexOf(tabUrl) > -1) { // We remove the website from the nopedWebsites;
        websitesNoped.splice(websitesNoped.indexOf(tabUrl), 1);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }
    for (tab in tabs) {
        if (tabs[tab] == tabUrl) {
            chrome.tabs.reload(parseInt(tab));
        }
    }
}

/* Chrome events. */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    tabs[sender.tab.id] = request.url;
    if (websitesNoped.indexOf(request.url) > -1) {
        if (nopeIsActivated) {
            sendResponse({nopeIt: true});
        } else {
            sendResponse({nopeIt: false});
        }
    } else {
        sendResponse({nopeIt: false});
    }
});

chrome.runtime.onStartup.addListener(function () {
    chrome.contextMenus.create({
        "enabled": false,
        "id": "nope",
        "onclick": function (info, tab) {},
        "title": "Reload this webpage to Nope it!"
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function (nopeSync) {
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

chrome.tabs.onRemoved.addListener(function (removeInfo) {
    delete tabs[removeInfo.tabId]; // Remove the tab in the dictionnary.
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    checkNope(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    if (changeInfo.status == "complete") {
        checkNope(tabId);
    }
});
