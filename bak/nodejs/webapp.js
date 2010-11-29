(function() {
  var get;
  get = function(path, callback) {
    console.log("PATH", path);
    return callback();
  };
  get("/", function() {
    return console.log("Hey Now!");
  });
  get("/:slug", function(slug) {
    return console.log("SLUG");
  });
}).call(this);
