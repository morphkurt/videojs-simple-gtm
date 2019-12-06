videojs.registerPlugin('simplegtm', function (options) {
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var debug = false;
    var firstPlay = false;

    if (options) {
        debug = options.debug;
    }

    var player = this,
        percentsPlayedInterval = options.percentsPlayedInterval,
        percentsAlreadyTracked = []

    var mapping
    var domainRegex = /^(http|https):\/\/[\w\d.:]+/g




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
            if (mapping["bcAnalytics_client_defaultParams_"]) {
                mapping["bcAnalytics_client_defaultParams_"].forEach(function (data) {
                    Object.keys(data).forEach(function (key) {

                        if (key == "pageName") {
                            _dataLayerArray[key] = player.bcAnalytics.client.defaultParams_[data[key]].replace(domainRegex,"")
                            debug && console.log('++++ added "' + key + '" : "' + player.bcAnalytics.client.defaultParams_[data[key]].replace(domainRegex,"") + '"}  +++ ');
                        } else {
                            _dataLayerArray[key] = player.bcAnalytics.client.defaultParams_[data[key]]
                            debug && console.log('++++ added "' + key + '" : "' + player.bcAnalytics.client.defaultParams_[data[key]] + '"}  +++ ');

                        }
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
            if (mapping["staticFields"]) {
                mapping["staticFields"].forEach(function (data) {
                    Object.keys(data).forEach(function (key) {
                        _dataLayerArray[key] = data[key]
                        debug && console.log('++++ added "' + key + '" : "' + data[key] + '"}  +++ ');
                    })
                })
            }
            // Special additons (if duration > 0 it will be a demand otherwise it will be live)
            if (player.mediainfo.duration > 0) {
                debug && console.log('++++ added mediaAssetDelivery : demand +++ ');
                _dataLayerArray['mediaAssetDelivery'] = 'demand'
            } else {
                debug && console.log('++++ added mediaAssetDelivery : live +++ ');
                _dataLayerArray['mediaAssetDelivery'] = 'live'
            }
            _dataLayerArray['mediaAssetType'] = 'video'
        }
        dataLayer.push(_dataLayerArray)
    });


    player.on('play', function () {
        debug && console.log('+++ play +++ ');
        if (firstPlay) {
            debug && console.log('+++ first play +++ ');
            dataLayer.push({ "event": "mediaPlayProgressStarted" })
            firstPlay = false
        } else {
            debug && console.log('+++ non first play +++ ');
            dataLayer.push({ "event": "mediaPlayBackStarted" })
        }
    });
    //
    player.on('loadstart', function () {
        debug && console.log('+++ loadstart +++ ');
        firstPlay = true;
    });

    player.on('pause', function () {
        debug && console.log('+++ pause +++ ');
        dataLayer.push({ "event": "mediaPlaybackPaused" })

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
