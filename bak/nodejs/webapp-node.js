var http = require('http');
var views = {
    "GET": {},
    "POST": {},
};

// Given a request, return a view
function view_from_request(request) {

    for (var path in views[request.method]) {

        if (path == request.url) {
            return views[request.method][path]();
        }

        // Substitute :keywords for regex patterns
        // TDD
        if (path.match(/:/)) {
            var regex_path = path.replace(/(\/\:\w+)$/g, "(.*)");
            var match = request.url.match(regex_path);

            if (match) {
                return views[request.method][path].apply(this, match);
            }
        }
    }
}

function handle_request(request, response) {

    response.writeHead(200, {'Content-Type': 'text/plain'});

    var callback = view_from_request(request);
    if (!callback) {
        return response.end("ERROR: No View Found");
    }

    return response.end(callback);
}

exports.get = function(path, callback) {
    views["GET"][path] = callback;
}

exports.post = function(path, callback) {
    views["POST"][path] = callback;
}

exports.run = function(port) {
    http.createServer(handle_request).listen(port);
    console.log('Server running at http://127.0.0.1:'+port+'/');
}
