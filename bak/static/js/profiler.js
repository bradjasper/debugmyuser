String.prototype.startsWith = function(str){
    return (this.indexOf(str) === 0);
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.sum = function(list) {
    var total = 0;
    for (var i in list) {
        total += list[i];
    }
    return total;
}

Array.average = function(list) {
    return Array.sum(list) / list.length;
}

function debug(msg) {
    if (window.console && window.console.firebug) {
        console.log(msg);
    }
}

var profiler = {
    update_delay: 1000,         // Number of ms to wait for more updates
    queue: [],                  // Pending items to update on server
    slug: $("#slug").html(),    // Grab slug from div
    prefix: "test_",            // All tests with this prefix will be run

    // Start running every key that starts with "test_"
    start: function() {
        debug("Starting compatibility tests...");
        BrowserDetect.init();
        for (var key in this) {
            if (key.startsWith(this.prefix)) {
                var ret = this[key]();
                if (ret) {
                    this.update(key, ret);
                }
            }
        }
    },

    // Queue an update to go to the server. Saves a couple of extra AJAX requests
    update: function(key, val) {
        debug("Adding " + key + "/" + val + " to queue...");
        this.queue.push([key, val]);
        setTimeout(this.send_request, this.update_delay);
    },

    // Send all items in the queue
    send_request: function() {
        var data = profiler.get_data();
        if (Object.size(data) > 0) {
            debug("Sending request for " + Object.size(data) + " updates...");
            $.ajax({
                type: "POST",
                url: document.URL + "/update",
                data: {"features": JSON.stringify(data)},
                dataType: "json",
                success: function(data, text, response) {
                    if (data.status == "ok") {
                        debug("Successfully updated server...");
                    } else {
                        debug("Unknown return: " + data.status);
                    }
                },
                error: function(response, status, error) {
                    debug("Error on profiler update '" + response.statusText + "'");
                }
            });
        }
    },

    // Grab data from the queue. We convert it from a list to an object like
    // this so that we can use atomic operations.
    get_data: function() {
        var tmp = profiler.queue.splice(0, profiler.queue.length);
        var data = {};
        for (var i in tmp) {
            var pair = tmp[i];
            var key = pair[0].replace(profiler.prefix, "");
            data[key] = pair[1];
        }
        return data;
    },

    // Test for screen resolution
    test_screen_resolution: function() {
        debug("Checking screen resolution...");
        if (window.screen) {
            var res = window.screen.width + "x" + window.screen.height;
            $("#screen_resolution").html(res);
            return res;
        }
    },

    // Get Platform from BrowserDetect
    test_os: function() {
        if ($("#os").html() == "unknown") {
            $("#os").html(BrowserDetect.OS);
            return BrowserDetect.OS;
        }
    },

    test_javascript: function() { 
        this.update("javascript", true);
        this.update("javascript_version", jsver);
        $("#javascript").html("Version " + jsver);
    },
    test_ajax: function() {
        $("#ajax").html("Checking...");
        $.get("/ajax", function(data) {
            if (data == "success") {
                $("#ajax").html("Yes");
                profiler.update("ajax", true);
            }
        });
    },
    // This should be switched to an embedded flash widget that callsback to the server
    test_flash: function() {
        var flashver = GetSwfVer();
        if (flashver) {
            this.update("flash_version", flashver);
            this.update("flash", true);
            $("#flash").html("Version " + flashver);
        }
    },
    test_browser: function() {
        var browser = $("#browser").html();
        if (browser.indexOf("Mozilla") != -1) {
            var browser = BrowserDetect.browser + " " + BrowserDetect.version;
            $("#browser").html(browser);
            return browser;
        }
    },
    test_connection_speed: function() {
        $("#connection_speed").html("Checking...");
        speed.start(function(mbit) {
            // We have to manually update since this is asynchrnous
            $("#connection_speed").html(mbit);
            profiler.update("connection_speed", mbit);
        });
    }
};
