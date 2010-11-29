var speed = {
    download_image: "/media/images/guitar.jpeg",
    get_time: function() { return (new Date()).getTime(); },
    test: function(callback) {
        var start_time = this.get_time();
        $.ajax({
            type: "GET",
            url: this.download_image + "?i=" + Math.random(),
            dataType: 'application/octet-stream',
            success: function(data) {
                var end_time = speed.get_time();
                var duration = (end_time - start_time) / 1000;
                var mbit = (data.length / 1024 / 1024 * 8);
                callback(mbit);
            },
            error: function(response, status, error) {
                debug("Error on download'" + response.statusText + "'");
            }
        });
    },
    start: function(callback, num_times) {
        var mbits = [];
        if (num_times == undefined) {
            num_times = 3;
        }

        function finished(mbit) {
            mbits.push(mbit);

            if (mbits.length == num_times) {
                callback(Array.average(mbits).toFixed(2) + "MBit");
            }
        }

        for (var i = 0; i < num_times; i++) {
            this.test(finished);
        }
    }
}
