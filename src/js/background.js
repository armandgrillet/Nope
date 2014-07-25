var nopeIsActivated; // Nope is activated or not?
var websitesNoped; // Webistes bloked by Nope.

/* Functions. */
function addNopeContextMenu () { // Update the context menu if the website can be added to Nope.
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            addNopeForWebsite(originUrl(tab.url));
        },
        "title": "Add Nope for this website"
    });
}

function addNopeForWebsite (tabUrl) { // The user clicked on "Add Nope for this website".
    if (websitesNoped.indexOf(tabUrl) == -1) { // We add the website to the nopedWebsites;
        websitesNoped.push(tabUrl);
        chrome.storage.sync.set({"websitesNoped": websitesNoped});
    }

    if (nopeIsActivated) { // Nope is activated, we have to block all the websites with a URL linked to Nope.
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.indexOf(tabUrl) == 0) { // The tab is on a website which has been affected by Nope.
                    chrome.tabs.update(tabs[i].id, {url: chrome.extension.getURL("nope.html?url=" + tabs[i].url)});
                }
            }
        });
    } else {
        removeNopeContextMenu(); // The context menu allow the removal of the website now.
    }
}

function changeNopeActivation () {
    nopeIsActivated = ! nopeIsActivated;
    chrome.storage.sync.set({"nopeIsActivated": nopeIsActivated});
    setNopeActivation();
}

function checkNope (tabUrl) { // Check variables and update the context menu.
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

function disableNope () { // Update the context menu if the website cannot be added to Nope.
    chrome.contextMenus.update("nope", {
        "enabled": false,
        "onclick": function (info, tab) {},
        "title": "This page can't be restricted by Nope!"
    });
}

function originUrl (url) { // Simulate a window.location.origin.
    return url.split('/')[0] + "//" + url.split('/')[2];
}

function removeNopeContextMenu () { // Update the context menu if the website can be removed to Nope.
    chrome.contextMenus.update("nope", {
        "enabled": true,
        "onclick": function (info, tab) {
            removeNopeForWebsite(originUrl(tab.url));
        },
        "title": "Remove Nope for this website"
    });
}

function removeNopeForWebsite (tabUrl) { // Remove nope from the websites noped.
    if (websitesNoped.indexOf(tabUrl) > -1) {
        websitesNoped.splice(websitesNoped.indexOf(tabUrl), 1);
        chrome.storage.sync.set({"websitesNoped": websitesNoped}, function () {
            addNopeContextMenu(); // Update the context menu.
        });
    }
}

function setNopeActivation () {
	if (nopeIsActivated) {
        chrome.browserAction.setIcon({path: "img/icon38.png"}, function () {
            chrome.browserAction.setTitle({title: "Deactivate Nope"});
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                	if (websitesNoped.indexOf(originUrl(tabs[i].url)) > -1) { // The tab is on a website which has been affected by Nope.
                        chrome.tabs.update(tabs[i].id, {url: chrome.extension.getURL("nope.html?url=" + tabs[i].url)});
                    }
                }
            });
        });
    } else {
        chrome.browserAction.setIcon({path: "img/icon38-disabled.png"}, function () {
            chrome.browserAction.setTitle({title: "Activate Nope"});
            chrome.tabs.query({}, function (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf("nope.html") > -1) { // e.g. "chrome-extension://nflenaaodhkcnhfcmkjnajommdjlocee/nope.html?url=http://korben.info/"
                        var url = null;
                        var regex = new RegExp("[\\?&]url=([^&#]*)").exec(tabs[i].url);
                        if (regex != null) {
                            chrome.tabs.update(tabs[i].id, {url: regex[1]});
                        }
                    }
                }
            });
        });
    }
}

function updateContextMenu (tabUrl) { // Update the context menu (or redirect to the nope page).
    if (nopeIsActivated) { // If Nope is activated.
        if (websitesNoped.indexOf(originUrl(tabUrl)) > -1) { // If the URL is noped.
            chrome.tabs.update({url: chrome.extension.getURL("nope.html?url=" + tabUrl)});
        } else {
            addNopeContextMenu();
        }
    } else {
        if (websitesNoped.indexOf(originUrl(tabUrl)) > -1) {
            removeNopeContextMenu();
        } else {
            addNopeContextMenu();
        }
    }
}

/* Chrome events. */
chrome.browserAction.onClicked.addListener(function () { // Click on the topbar button.
    if (nopeIsActivated == undefined) {
        chrome.storage.sync.get(["nopeIsActivated", "websitesNoped"], function(nopeSync) {
            nopeIsActivated = nopeSync.nopeIsActivated;
            websitesNoped = nopeSync.websitesNoped;
            changeNopeActivation();
        });
    } else {
        changeNopeActivation();
    }
});

chrome.runtime.onStartup.addListener(function () { // Chrome is launched.
    chrome.contextMenus.create({
        "enabled": false,
        "id": "nope",
        "onclick": function (info, tab) {},
        "title": "Nope"
    });
    chrome.storage.sync.get("nopeIsActivated", function (nopeSync) {
	    nopeIsActivated = nopeSync.nopeIsActivated;
	    setNopeActivation
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function (nopeSync) {
        if (nopeSync.websitesNoped == undefined) {
            chrome.storage.sync.set({"websitesNoped": []});
        } else {
            websitesNoped = nopeSync.websitesNoped;
        }

        if (nopeSync.nopeIsActivated == undefined) {
            chrome.storage.sync.set({"nopeIsActivated": true});
            nopeIsActivated = true;
            setNopeActivation();
        } else {
        	nopeIsActivated = nopeSync.nopeIsActivated;
            setNopeActivation();
        }
    });
    chrome.contextMenus.create({
        "enabled": false,
        "id": "nope",
        "onclick": function (info, tab) {},
        "title": "Nope"
    });
});

chrome.storage.onChanged.addListener(function (changes, namespace) { // What to do when a storage value is changed.
    for (key in changes) {
        switch (key) {
            case "websitesNoped":
                chrome.storage.sync.get("websitesNoped", function(nopeSync) {
			        websitesNoped = nopeSync.websitesNoped;
			        chrome.tabs.query({}, function (tabs) {
			            for (var i = 0; i < tabs.length; i++) {
			                if (tabs[i].url.indexOf("nope.html") > -1) { // e.g. "chrome-extension://nflenaaodhkcnhfcmkjnajommdjlocee/nope.html?url=http://korben.info/"
			                    var url = null;
			                    var regex = new RegExp("[\\?&]url=([^&#]*)").exec(tabs[i].url);
			                    if (regex != null && websitesNoped.indexOf(originUrl(regex[1])) == -1) { // The tab is on Nope and the url is now accepted.
			                        chrome.tabs.update(tabs[i].id, {url: regex[1]});
			                    }
			                }
			            }
			        });
			    });
                break;
        }
    }
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
        if (updatedTab.url.indexOf("http:") == 0 || updatedTab.url.indexOf("https:") == 0) { // A webpage is loading.
            checkNope(updatedTab.url);
        } else { // This is not a webpage.
            disableNope();
        }
    }
});
