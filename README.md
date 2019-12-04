# videojs-simple-gtm
A VideoJS Plugin to Fire off Google Tag Manager Events

Alternative Video JS plugin to fire off Google Tag Manager events.

## Example Usage

```html
 <script src="https://players.brightcove.net/00000000/default_default/index.min.js"></script>
    <script type="text/javascript" src="js/videojs.simple.gtm.js"></script>
    <script type="text/javascript">
        var options = {
            "mapping": {
                "mediainfo": [
                    { "mediaAssetAccount": "accountId" },
                    { "mediaAssetID": "id" },
                    { "mediaAssetTitle": "name" },
                    { "mediaAssetDuration": "duration" },
                    { "mediaAssetDescription": "description" }
                ],
                "bcAnalytics.client.defaultParams_": [
                    { "pageName": "destination" },
                    { "mediaPlayerName": "player_name" },
                    { "mediaAssetSessionID": "session" },
                    { "mediaPlatformVersion": "platform_version" }
                ],
                "customFields": [
                    { "matchSeasonName": "season_name" },
                    { "matchChampionID": "match_champion_id" },
                    { "matchRoundName": "round_name" },
                    { "mediaProgramCategory": "program_category" },
                    { "mediaProgramType": "program_type" },
                    { "mediaAssetPubisherName": "content_provider" },
                    { "mediaAdStatus": "no_ads" },
                    { "competition": "competition" }
                ]
            },
            "percentsPlayedInterval": 25,
            "debug": false
        };
    </script>
    <script>
        videojs.getPlayer('player').simplegtm(options);
    </script>
```


