videojs.registerPlugin('simplegtm', function (options) {
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var debug = false;
    var firstPlay = false;
    var _dataLayerArray;
    var mediaPlayBackPosition = 0;


    if (options) {
        debug = (window.localStorage.getItem("sdsat_debug") == 'true') || options.debug;
    }



    var player = this,
        percentsPlayedInterval = options.percentsPlayedInterval,
        percentsAlreadyTracked = []

    function populateData() {
        _dataLayerArray = {};
        if (!options.mapping) {
            debug && console.log('++++ mapping data not provided +++ ');
        } else {
            var mapping = options.mapping.values
            debug && console.log('++++ Printing mapping Array Pre Sort');
            mapping.sort(function (a, b) {
                return a.rank - b.rank;
            })
            debug && console.log('++++ Printing mapping Array Post Sort');
            mapping.forEach(item => {
                if (item['location'] == "mediainfo") {
                    _dataLayerArray[item['value']] = player.mediainfo[item['extractValue']] || ''
                }
                else if (item['location'] == "bcAnalytics_client_defaultParams_") {
                    _dataLayerArray[item['value']] = player.bcAnalytics.client.defaultParams_[item['extractValue']] || ''
                }
                else if (item['location'] == "customFields") {
                    _dataLayerArray[item['value']] = player.mediainfo.customFields[item['extractValue']] || ''
                }
                else if (item['location'] == "staticFields") {
                    _dataLayerArray[item['value']] = item['extractValue']
                }
                else if (item['location'] == "dataLayer") {
                    dataLayer.forEach(d => {
                        const keys = Object.keys(d)
                        for (const key of keys) {
                            if (key == item['extractValue'] && !d[key].length == 0 ){
                                _dataLayerArray[item['value']] = d[key];
                            }
                        }
                    })
                }
                if (item['modifier']) {
                    debug && console.log('++++ Modifying From "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');
                    _dataLayerArray[item['value']] = modify(item['modifier'], _dataLayerArray[item['value']])
                    debug && console.log('++++ Modifying To "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');
                }
                debug && console.log('++++ added "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');

            })

        }
    }


    player.on('loadedmetadata', function () {
        debug && console.log('++++ loadedmetadata +++ ');
    });

    player.on('play', function () {
        debug && console.log('+++ play +++ ');
        if (firstPlay) {
            debug && console.log('+++ first play +++ ');
            populateData();
            pushDataLayer('mediaPlayProgressStarted', 0)
            firstPlay = false
        } else {
            debug && console.log('+++ non first play +++ ');
            pushDataLayer('mediaPlayBackStarted', mediaPlayBackPosition)

        }
    });
    //
    player.on('loadstart', function () {
        debug && console.log('+++ loadstart +++ ');
        firstPlay = true;
        percentsAlreadyTracked = [];
    });

    player.on('pause', function () {

        var currentTime = Math.round(this.currentTime());
        var duration = Math.round(this.duration());
        var percentPlayed = Math.round(currentTime / duration * 100);
        debug && console.log('+++ Percentage played' + percentPlayed + ' +++ ');
        if (percentPlayed < 99) {
            debug && console.log('+++ pause +++ ');
            pushDataLayer('mediaPlaybackPaused', mediaPlayBackPosition)

        } else {
            debug && console.log('+++ pause at the end detected +++ ');
        }
    });

    player.on('ended', function () {
        debug && console.log('+++ ended +++ ');
        pushDataLayer('mediaPlaybackFinished', 1)
        mediaPlayBackPosition = 0;


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
                        mediaPlayBackPosition = percent / 100;
                        pushDataLayer('mediaPlayProgress', percent / 100)
                    }
                }
                if (percentPlayed > 0) {
                    percentsAlreadyTracked.push(percent);
                }
            }
        }
    });

    function pushDataLayer(event, progressPosition) {
        _dataLayerObject = {}
        _dataLayerObject['event'] = event;
        _dataLayerObject['mediaPlayProgressPosition'] = progressPosition
        _dataLayerObject['timestamp'] = Date.now()
        var _finalDataLayerArray = Object.assign(_dataLayerObject, _dataLayerArray)
        dataLayer.push(_finalDataLayerArray)
    }

    function modify(object, value) {
        if (object['type'] == 'replace') {
            var regex = new RegExp(atob(object['regexBase64']), "g");
            return value.replace(regex, object['replaceValue'])
        } else if (object['type'] == 'comparator') {
            if (object['operator'] == "==") {
                return (value == object['variable']) ? object['value1'] : object['value2']
            }
        } else if (object['type'] == "addSpace") {
            return addSpace(value);
        }
        else if (object['type'] == "convertDate") {
            return convertDate(value);
        } else if (object['type'] == "convertTime") {
            return convertTime(value);
        }
        else if (object['type'] == "arrayContains") {
            return (arrayContains(player.mediainfo['tags'], object['variable'])) ? object['value1'] : object['value2']
        }
        else {
            return value;
        }
    }

    function arrayContains(array, variable) {
        let returnVal = false;
        array.forEach(v => {
            if (v == variable) returnVal = true
        })
        return returnVal;
    }

    function convertTime(d) {
        var options = {
            timeZone: 'Australia/Brisbane',
            hour: 'numeric', minute: 'numeric', second: 'numeric',

            hour12: false,
            timeZoneName: 'short'
        }
        formatter = new Intl.DateTimeFormat('en-AU', options)
        return formatter.format(new Date(d));
    }

    function convertDate(d) {
        var options = {
            timeZone: 'Australia/Brisbane',
            literal: '-',
            year: 'numeric', month: 'numeric', day: 'numeric'
        }
        formatter = new Intl.DateTimeFormat('en-AU', options)
        return formatter.format(new Date(d)).replace(/\//g, '-');
    }

    function ArrNoDupe(a) {
        var temp = {};
        for (var i = 0; i < a.length; i++) temp[a[i]] = true;
        return Object.keys(temp);
    }

    function addSpace(v) {
        let cut = []
        let words = [];
        cut.push(0);
        for (i = 0; i < v.length - 1; i++) {
            let s = v.substring(i, i + 2)
            if (/[0-9][A-Z]/g.test(v.substring(i, i + 2))) cut.push(i + 1);
            if (/[a-z][A-Z0-9]/g.test(v.substring(i, i + 2))) cut.push(i + 1);
            if (/[A-Z0-9][a-z]/g.test(v.substring(i, i + 2))) cut.push(i);
        }
        cut.push(v.length);
        let uA = ArrNoDupe(cut);
        for (i = 1; i < uA.length; i++) words.push(v.substring(uA[i - 1], uA[i]))
        var sentence = ''
        words.forEach(w => { sentence += w + " " })
        return sentence.replace(/(AFL)/g, ' $1').replace(/ +(?= )/g, '').trim()
    }



});
