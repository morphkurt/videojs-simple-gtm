videojs.registerPlugin('simplegtm', function (options) {
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var debug = false;

    if (options) {
        debug = options.debug;
    }

    var player = this,
        percentsPlayedInterval = options.percentsPlayedInterval,
        percentsAlreadyTracked = []

    var mapping


    player.on('loadedmetadata', function () {
        var _dataLayerArray = {};
        debug && console.log('++++ loadedmetadata +++ ');

        if (!options.mapping) {
            debug && console.log('++++ mapping data not provided +++ ');
        } else {
            var mapping = options.mapping
            if (mapping["mediainfo"]) {
                mapping["mediainfo"].forEach(function (data) {
                    Object.keys(data).forEach(function (key) {
                        _dataLayerArray[key] = player.mediainfo[data[key]]
                        debug && console.log('++++ added "' + key + '" : "' + player.mediainfo[data[key]] + '"}  +++ ');
                    })
                })
            }
            if (mapping["bcAnalytics.client.defaultParams_"]) {
                mapping["bcAnalytics.client.defaultParams_"].forEach(function (data) {
                    Object.keys(data).forEach(function (key) {
                        _dataLayerArray[key] = player.bcAnalytics.client.defaultParams_[data[key]]
                        debug && console.log('++++ added "' + key + '" : "' + player.bcAnalytics.client.defaultParams_[data[key]] + '"}  +++ ');
                    })
                })
            }
            if (mapping["customFields"]) {
                mapping["customFields"].forEach(function (data) {
                    Object.keys(data).forEach(function (key) {
                        _dataLayerArray[key] = player.mediainfo.customFields[data[key]]
                        debug && console.log('++++ added "' + key + '" : "' + player.mediainfo.customFields[data[key]] + '"}  +++ ');
                    })
                })
            }
        }
        dataLayer.push(_dataLayerArray)
    });


    player.on('play', function () {
        debug && console.log('+++ play +++ ');
        dataLayer.push({ "event": "mediaPlayProgressStarted" })
    });

    player.on('ended', function () {
        debug && console.log('+++ ended +++ ');
        dataLayer.push({ "event": "mediaPlaybackFinished" })
    });

    player.on('timeupdate', function () {
        debug && console.log('+++ timeupdate +++ ');
        var currentTime = Math.round(this.currentTime());
        var duration = Math.round(this.duration());
        var percentPlayed = Math.round(currentTime / duration * 100);
        for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
            if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
                if (percentPlayed !== 0) {
                    if (percent > 0) {
                        debug && console.log(percent + '% Milestone Passed');
                        dataLayer.push({
                            "event": "mediaPlayProgress",
                            "mediaPlayProgressPosition": percent / 100
                        })
                    }
                }
                if (percentPlayed > 0) {
                    percentsAlreadyTracked.push(percent);
                }
            }
        }
    });

});
