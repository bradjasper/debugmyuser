
var webapp = require("./webapp");

webapp.get("/", function() {
    return "Hello World";
});

webapp.post("/", function() {
    return "POST HELLO WORLD";
});

webapp.get("/:slug", function(slug) {
    return "Found Slug" + slug;
});


webapp.run(8080);
