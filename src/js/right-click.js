// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.
function onClickHandler(info, tab) {
  if (info.menuItemId == "nope") {
    console.log(JSON.stringify(info));
    console.log("checkbox item " + info.menuItemId +
                " was clicked, state is now: " + info.checked +
                " (previous state was " + info.wasChecked + ")");

  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": "Blocked by Nope",
        "type": "checkbox",
        "id": "nope"
    });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    // Update contextMenu
    console.log("hey");
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    // update contextMenu
    if (changeInfo.status == "loading") {
        console.log(changeInfo.status);
    }
});
