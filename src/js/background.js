var nopeIsActivated; // Nope is activated or not?
var websitesNoped; // Webistes bloked by Nope.

/* Functions. */
function addNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            addNopeForWebsite(originUrl(tab.url));
        },
        "title": "Add Nope for this website"
    });
}

function addNopeForWebsite (tabUrl) {
    if (websitesNoped.indexOf(tabUrl) == -1) { // We add the website to the nopedWebsites;
        websitesNoped.push(tabUrl);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }

    if (nopeIsActivated) {
        chrome.tabs.query({}, function (tabs) { // The Query {} was missing here
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.indexOf(tabUrl) == 0) { // The tab is on a website which has been affected by Nope.
                    chrome.tabs.update(tabs[i].id, {url: chrome.extension.getURL("nope.html?url=" + tabs[i].url)});
                }
            }
        });
    } else {
        removeNopeContextMenu();
    }
}

function changeNopeActivation () {
    nopeIsActivated = ! nopeIsActivated;
    chrome.storage.sync.set({"nopeIsActivated": nopeIsActivated});

    if (nopeIsActivated) {
        chrome.browserAction.setIcon({path: "img/icon16.png"}, function () {
            chrome.tabs.query({}, function (tabs) { // The Query {} was missing here
                for (var i = 0; i < tabs.length; i++) {
                    for (var j = 0; j < websitesNoped.length; j++) {
                        if (tabs[i].url.indexOf(websitesNoped[j]) == 0) { // The tab is on a website which has been affected by Nope.
                            chrome.tabs.update(tabs[i].id, {url: chrome.extension.getURL("nope.html?url=" + tabs[i].url)});
                        }
                    }  
                }
            });
        });
    } else {
        chrome.browserAction.setIcon({
            path: "img/icon16-disabled.png"
        });
    }
}

function checkNope (tabUrl) {
    /* Check variables. */
    if (websitesNoped == undefined || nopeIsActivated == undefined) {
        chrome.storage.sync.get(["nopeIsActivated", "websitesNoped"], function(nopeSync) {
            nopeIsActivated = nopeSync.nopeIsActivated;
            websitesNoped = nopeSync.websitesNoped;
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

function originUrl (url) {
    return url.split('/')[0] + "//" + url.split('/')[2];
}

function updateContextMenu (tabUrl) {
    if (nopeIsActivated) { // If Nope is activated.
        if (websitesNoped.indexOf(originUrl(tabUrl)) > -1) {
            chrome.tabs.update({url: chrome.extension.getURL("nope.html?url=" + tabUrl)});
        } else {
            addNopeContextMenu();
        }
    } else {
        if (websitesNoped.indexOf(tabUrl) > -1) {
            removeNopeContextMenu();
        } else {
            addNopeContextMenu();
        }
    }
}

function removeNopeContextMenu () {
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            removeNopeForWebsite(originUrl(tab.url));
        },
        "title": "Remove Nope for this website"
    });
}

function removeNopeForWebsite (tabUrl) {
    if (websitesNoped.indexOf(tabUrl) > -1) { // We remove the website from the nopedWebsites;
        websitesNoped.splice(websitesNoped.indexOf(tabUrl), 1);
        chrome.storage.sync.set({"websitesNoped": websitesNoped}, function () {
            addNopeContextMenu();
        });
    }
}

function updateWebsitesNoped () {
    chrome.storage.sync.get("websitesNoped", function(nopeSync) {
        websitesNoped = nopeSync.websitesNoped;
    });
}

/* Chrome events. */
chrome.browserAction.onClicked.addListener(function () {
    if (nopeIsActivated == undefined) {
        chrome.storage.sync.get(["nopeIsActivated", "websitesNoped"], function(nopeSync) {
            nopeIsActivated = nopeSync.nopeIsActivated;
            console.log("Avant : " + nopeIsActivated);
            websitesNoped = nopeSync.websitesNoped;
            changeNopeActivation();
        });
    } else {
        changeNopeActivation();
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
        "title": "Nope"
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) { // New tab, we check the url.
        if (tab.url.indexOf("http:") == 0 || tab.url.indexOf("https:") == 0) { // This is a normal webpage.
            checkNope(tab.url);
        } else {
            disableNope();
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    if (changeInfo.status == "loading") { // Something is loading.
        if (updatedTab.url.indexOf("http:") == 0 || updatedTab.url.indexOf("https:") == 0) {// A webpage is loading.
            checkNope(updatedTab.url);
        } else { // This is not a webpage.
            disableNope();
        }
    }
});

chrome.storage.onChanged.addListener(function (changes, namespace) { // What to do when a storage value is changed.
    for (key in changes) {
        switch (key) {
            case "websitesNoped":
                updateWebsitesNoped();
                break;
        }
    }
});
