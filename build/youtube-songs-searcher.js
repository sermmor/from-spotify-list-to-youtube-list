"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require("node-fetch");
var secondsWaiting = 5;
var millisecondsBetweenSearchs = secondsWaiting * 1000;
var youtubeApi;
var youtubeUserData;
exports.youtubePlaylist = function (userData, playlist, callback) {
    console.log("Youtube searching begins...");
    youtubeUserData = userData["youtube"];
    setTimeout(function () { return searchInYoutube(playlist, callback); }, 0);
    // youtubeApi = new youtube_v3.Youtube({auth: youtubeUserData["keyAPI"]});
    // const opts = {
    //     maxResults: 1,
    //   };
    // let timeToSearch = 0;
    // for (let i = 0; i < playlist.length; i++) {
    //     const { toSearch } = playlist[i];
    //     setTimeout(() => searchInYoutube(toSearch, opts, playlist, i, callback), timeToSearch);
    //     timeToSearch += millisecondsBetweenSearchs;
    // }
};
var keyUrlGetter = 'href="/watch?';
var genericUrlYoutubeVideo = "https://www.youtube.com/watch?"; //"https://www.youtube.com/watch?v=";
var againstPlaylistSearches = "&sp=EgIQAQ%253D%253D";
var searchInYoutube = function (playlist, callback, index) {
    if (index === void 0) { index = 0; }
    var queryToSearch = formatQuery(playlist[index].toSearch);
    fetch("https://www.youtube.com/results?search_query=" + queryToSearch + againstPlaylistSearches)
        .then(function (response) {
        // console.log(response);
        return response.text();
    }).then(function (response) {
        var keyIdUrlVideo = getYoutubeIdKeyOfFirstVideoResult(response);
        if (!keyIdUrlVideo) {
            repeatCallingToYoutube(playlist, callback, index);
            return;
        }
        playlist[index].youtubeUrl = "" + genericUrlYoutubeVideo + keyIdUrlVideo;
        console.log("Searched " + queryToSearch + ": " + playlist[index].youtubeUrl);
        callToYoutubeNextSongInPlaylist(playlist, callback, index);
    }).catch(function (error) {
        console.log("ERROR: INCORRECT query " + queryToSearch + ".");
        playlist[index].youtubeUrl = "ERROR WITH QUERY '" + queryToSearch + "'";
        callToYoutubeNextSongInPlaylist(playlist, callback, index);
    });
};
var getYoutubeIdKeyOfFirstVideoResult = function (response) {
    var idKeyVideo = undefined;
    if (response && response.split) {
        var keyBegins = response.split(keyUrlGetter);
        if (keyBegins) {
            keyBegins = keyBegins[1];
            if (keyBegins) {
                keyBegins = keyBegins.split('"');
                if (keyBegins) {
                    idKeyVideo = keyBegins[0];
                }
            }
        }
    }
    return idKeyVideo;
};
var repeatCallingToYoutube = function (playlist, callback, index) {
    if (index === void 0) { index = 0; }
    console.log("Error in search petition... Trying again in " + secondsWaiting + " seconds.");
    setTimeout(function () { return searchInYoutube(playlist, callback, index); }, millisecondsBetweenSearchs);
};
var callToYoutubeNextSongInPlaylist = function (playlist, callback, index) {
    if (index === void 0) { index = 0; }
    if (index + 1 < playlist.length) {
        console.log("Waiting " + secondsWaiting + " seconds to the next search.");
        setTimeout(function () { return searchInYoutube(playlist, callback, index + 1); }, millisecondsBetweenSearchs);
    }
    else {
        console.log("Search ended");
        callback(playlist);
    }
};
var formatQuery = function (toSearch) {
    var splitedSearch = toSearch.split(" ");
    // const formatedSplitedSearch = splitedSearch.map(word => encodeURI(formatWordQuery(word)));
    var formatedSplitedSearch = splitedSearch.map(function (word) { return formatWordQuery(word); });
    console.log(formatedSplitedSearch.join('+'));
    return formatedSplitedSearch.join('+');
};
var formatWordQuery = function (word) {
    var firstReplace = word.replace(/&/g, "%26").replace(/>/g, "").replace(/</g, "").replace(/"/g, "")
        .replace(/'/g, "").replace(/-/g, "+").replace(/á/gi, "a").replace(/é/gi, "e").replace(/í/gi, "i")
        .replace(/ó/gi, "o").replace(/ú/gi, "u").replace(/à/gi, "a").replace(/è/gi, "e").replace(/ì/gi, "i")
        .replace(/ò/gi, "o").replace(/ù/gi, "u").replace(/ä/gi, "a").replace(/ë/gi, "e").replace(/ï/gi, "i")
        .replace(/ö/gi, "o").replace(/ü/gi, "u").replace(/â/gi, "a").replace(/ê/gi, "e").replace(/î/gi, "i")
        .replace(/ô/gi, "o").replace(/û/gi, "u").replace(/’/g, "").replace(/:/g, "+").replace(/{/g, "")
        .replace(/}/g, "").replace(/,/g, "+").replace(/;/g, "+").replace(/–/g, "+");
    return simplifySeparatorBetweenQueryWords(replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(firstReplace, "/", "+"), "(", ""), "[", ""), ")", ""), "]", ""), ".", "+"));
};
var replaceAll = function (word, toReplace, toPut) {
    return word.split(toReplace).join(toPut);
};
var simplifySeparatorBetweenQueryWords = function (word) {
    return word.split('+').reduce(function (acc, current) { return (current === "") ? acc : acc + "+" + current; });
};
var searchInYoutubeAPI = function (toSearch, opts, playlist, index, callback) {
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
