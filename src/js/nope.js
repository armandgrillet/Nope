chrome.runtime.sendMessage({url: window.location.origin}, function(response) {
    if (response.websiteIsNoped) {

    } else {
        console.log("Le site n'est pas bloqué");
    }
});
