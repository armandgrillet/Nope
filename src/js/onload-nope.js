window.onload = function () {
    /* Colors. */
    document.getElementById("title").style.color = color;

    /* Fonts. */
    document.getElementById("title").style.fontFamily = "'" + font + "', cursive";
    document.getElementById("title").style.display = "block";
    document.getElementById("title").className = "animated tada";

    /* Last url */
    var url = null;
    var originUrl = null;
  	var regex = new RegExp("[\\?&]url=([^&#]*)").exec(window.location.href);
	if (regex != null) {
	    url = regex[1];
	    originUrl = url.split('/')[0] + "//" + url.split('/')[2];
	    document.getElementById("remove-nope").innerHTML = "Remove Nope for " + originUrl;
	    chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
			if (nopeSync.websitesNoped.indexOf(originUrl) == -1) {
				window.close();
			}
		});
	} else {
		window.close();
	}

	document.getElementById("remove-nope").onclick = function () {
		chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
			if (nopeSync.websitesNoped.indexOf(originUrl) > -1) {
				var websitesNoped = nopeSync.websitesNoped;
				websitesNoped.splice(websitesNoped.indexOf(originUrl), 1);
        		chrome.storage.sync.set({"websitesNoped": websitesNoped}, function () {
        			window.location.href = url;
        		});
			} else {
				window.close();
			}
        });
	};
}
