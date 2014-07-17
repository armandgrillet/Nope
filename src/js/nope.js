chrome.runtime.sendMessage({url: window.location.origin}, function(response) {
    if (response.nopeIt) {
        console.log("Le site est bloqué");
    } else {
        console.log("Le site n'est pas bloqué");
    }
});
