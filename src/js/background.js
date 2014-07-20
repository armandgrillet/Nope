var websitesNoped; // Webistes bloked by Nope.
var nopeIsActivated;

/* Functions. */
function addNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            addNopeForWebsite(tab.url.split('/')[0] + "//" + tab.url.split('/')[2]);
        },
        "title": "Add Nope for this website"
    });
}

function addNopeForWebsite (tabUrl) {
    if (websitesNoped.indexOf(tabUrl) == -1) { // We add the website to the nopedWebsites;
        websitesNoped.push(tabUrl);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }
    chrome.tabs.query( {} ,function (tabs) { // The Query {} was missing here
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url.indexOf(tabUrl) == 0) { // The tab is on a website which has been affected by Nope.
                chrome.tabs.executeScript(tabs[i].id, {file: "js/redirect.js"});
            }
        }
    });
}

function checkNope (tabUrl) {
    /* Check variables. */
    if (websitesNoped == undefined || nopeIsActivated == undefined) {
        chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
            websitesNoped = nopeSync.websitesNoped;
            nopeIsActivated = nopeSync.nopeIsActivated;
            updateContextMenu(tabUrl);
        });
    } else {
        updateContextMenu(tabUrl);
    }
}

function disableNope () {
    chrome.contextMenus.update("nope", {
        "enabled": false,
        "onclick": function (info, tab) {},
        "title": "This page can't be restricted by Nope!"
    });
}

function updateContextMenu (tabUrl) {
    if (websitesNoped.indexOf(tabUrl) > -1) {
        console.log("On le connait");
        chrome.tabs.executeScript(null, {file: "js/redirect.js"});
    } else {
        addNopeContextMenu();
    }
}

function removeNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            removeNopeForWebsite(tab.url.split('/')[0] + "//" + tab.url.split('/')[2]);
        },
        "title": "Remove Nope for this website"
    });
}

function removeNopeForWebsite (tabUrl) {
    if (websitesNoped.indexOf(tabUrl) > -1) { // We remove the website from the nopedWebsites;
        websitesNoped.splice(websitesNoped.indexOf(tabUrl), 1);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }
}

/* Chrome events. */
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
        "title": "Nope"
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) { // New tab, we check the url.
        if (tab.url.indexOf("http:") == 0 || tab.url.indexOf("https:") == 0) { // This is a normal webpage.
            checkNope(tab.url.split('/')[0] + "//" + tab.url.split('/')[2]);
        } else {
            disableNope();
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    if (changeInfo.status == "loading") { // Something is loading.
        if (updatedTab.url.indexOf("http:") == 0 || updatedTab.url.indexOf("https:") == 0) {// A webpage is loading.
            checkNope(updatedTab.url.split('/')[0] + "//" + updatedTab.url.split('/')[2]);
        } else { // This is not a webpage.
            disableNope();
        }
    }
});
