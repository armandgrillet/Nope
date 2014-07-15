window.onload = function () {
    /* Colors. */
    $("#title").css("color", color);

    /* Fonts. */
    $("#title").css("font-family", "'" + font + "', cursive");
    $("#title").css("display", "block");

    $("#title").addClass("animated tada");
    $("#title").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function () {
        $("#container").addClass("animated fadeOut");
    });
}
