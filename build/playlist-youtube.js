"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var googleapis_1 = require("googleapis");
var millisecondsBetweenSearchs = 10 * 1000;
var youtubeApi;
var youtubeUserData;
exports.youtubePlaylist = function (userData, playlist, callback) {
    console.log("Youtube searching begins...");
    youtubeUserData = userData["youtube"];
    youtubeApi = new googleapis_1.youtube_v3.Youtube({ auth: youtubeUserData["keyAPI"] });
    var opts = {
        maxResults: 1,
    };
    var timeToSearch = 0;
    var _loop_1 = function (i) {
        var toSearch = playlist[i].toSearch;
        setTimeout(function () { return searchInYoutube(toSearch, opts, playlist, i, callback); }, timeToSearch);
        timeToSearch += millisecondsBetweenSearchs;
    };
    for (var i = 0; i < playlist.length; i++) {
        _loop_1(i);
    }
};
var searchInYoutube = function (toSearch, opts, playlist, index, callback) {
    youtubeApi.search.list({
        part: 'id',
        type: 'video',
        q: toSearch,
        order: 'relevance',
        safeSearch: 'none',
        maxResults: opts.maxResults,
        videoEmbeddable: 'any'
    }, function (err, response) {
        if (err)
            return console.log(err);
        var videoId = response["data"]["items"][0]["id"]["videoId"];
        playlist[index].youtubeUrl = "https://www.youtube.com/watch?v=" + videoId;
        console.log("Got youtube song \"" + toSearch + "\" ( " + playlist[index].youtubeUrl + " )");
        if (index === playlist.length - 1) {
            callback(playlist);
        }
    });
};
