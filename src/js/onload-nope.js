window.onload = function () {
    /* Colors. */
    $("#title").css("color", color);

    /* Fonts. */
    $("#title").css("font-family", "'" + font + "', cursive");
    $("#title").css("display", "block");

    $("#title").addClass("animated tada");

    /* Last url */
    var url = null;
  	var regex = new RegExp("[\\?&]url=([^&#]*)").exec(window.location.href);
	if (regex != null) {
	    url = regex[1];
	    // TODO : Display block
	    document.getElementById("remove-nope").innerHTML = "Remove Nope for " + url.split('/')[0] + "//" + url.split('/')[2];
	}	
	
}
