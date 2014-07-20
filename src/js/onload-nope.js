window.onload = function () {
    /* Colors. */
    $("#title").css("color", color);

    /* Fonts. */
    $("#title").css("font-family", "'" + font + "', cursive");
    $("#title").css("display", "block");

    $("#title").addClass("animated tada");

    /* Last url */
    var url = null;
    var originUrl = null;
  	var regex = new RegExp("[\\?&]url=([^&#]*)").exec(window.location.href);
	if (regex != null) {
	    url = regex[1];
	    originUrl = url.split('/')[0] + "//" + url.split('/')[2];
	    // TODO : Display block
	    $("#remove-nope").html("Remove Nope for " + originUrl);
	    chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
			if (nopeSync.websitesNoped.indexOf(originUrl) == -1) {
				window.close();
			}
		});
	} else {
		window.close();
	}

	$("#remove-nope").on("click", function () {
		chrome.storage.sync.get(["websitesNoped", "nopeIsActivated"], function(nopeSync) {
			console.log(nopeSync.websitesNoped.indexOf(originUrl));
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
	});
}
