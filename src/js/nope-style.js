/* Colors. */
var colors = [
    "#c95584", // A+A L
    "#51a5d1", // A+A R
    "#2d72d9", // Designer News
    "#1ABC9C", // Flat UI
    "#8E44AD", // Flat UI
    "#E74C3C", // Flat UI
    "#ee3423", // Path
    "#333", // Typographica
];
var color = colors[Math.floor(Math.random() * colors.length)];

/* Fonts. */
var fonts = ["Indie Flower", "Shadows Into Light", "Pacifico", "Dancing Script", "Marck Script", "Calligraffitti", "Berkshire Swash", "Kaushan Script", "Damion", "Niconne", "Courgette", "Rochester", "Parisienne", "Merienda One", "Alex Brush", "La Belle Aurore", "Norican", "Redressed", "Julee", "Condiment"];
var font = fonts[Math.floor(Math.random() * fonts.length)];

WebFont.load({
    google: {
      families: [font]
    }
});
