"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi;
var spotifyUserData;
exports.getTheSpotifyPlaylist = function (userData, callback) {
    spotifyUserData = userData["spotify"];
    spotifyApi = new SpotifyWebApi({
        clientId: spotifyUserData["clientId"],
        clientSecret: spotifyUserData["clientSecret"],
        redirectUri: spotifyUserData["redirectUri"],
    });
    if (spotifyUserData["getNewKeyApi"]) {
        generateNewAutorizeUrl();
    }
    else {
        launchAuthorizationProcessOrMain(callback);
    }
};
var generateNewAutorizeUrl = function () {
    var scopes = ['user-read-private', 'user-read-email'];
    var state = 'some-state-of-my-choice';
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    console.log("Copy the following url and paste in your browser so the callback url paste in networks.json (section 'urlCallback'), in the next call you can paste the access_token in networks.json.");
    console.log(authorizeURL);
};
var launchAuthorizationProcessOrMain = function (callback) {
    if (spotifyUserData["access_token"]) {
        spotifyApi.setAccessToken(spotifyUserData["access_token"]);
        main(callback);
    }
    else {
        var urlCallback = spotifyUserData["urlCallback"];
        var code = urlCallback.split('code=')[1].split('&state')[0];
        spotifyApi.authorizationCodeGrant(code).then(function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);
            // Set the access token on the API object to use it in later calls
            spotifyUserData["access_token"] = data.body['access_token'];
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            main(callback);
        }, function (err) {
            console.log('Something went wrong!', err);
        });
    }
};
var allSongsPlaylist = [];
var main = function (callback, offset) {
    if (offset === void 0) { offset = 0; }
    var numberTrack = offset;
    spotifyApi.getPlaylistTracks(spotifyUserData["playlistId"], {
        offset: offset,
        fields: 'items'
    })
        .then(function (data) {
        if (!data.body || !data.body["items"] || data.body["items"].length === 0) {
            exports.savePlaylistResultInFile(allSongsPlaylist, callback);
            return;
        }
        data.body["items"].forEach(function (item) {
            var track = item["track"];
            allSongsPlaylist.push({
                position: numberTrack,
                toSearch: track["artists"][0]["name"] + " " + track["name"],
                youtubeUrl: '',
            });
            numberTrack++;
        });
        setTimeout(function () { return main(callback, numberTrack); }, 0);
    }, function (err) {
        console.log('Something went wrong!', err);
    });
};
exports.savePlaylistResultInFile = function (playlist, callback) {
    var strAllTuits = JSON.stringify(playlist, null, 2);
    fs_1.writeFileSync('playlistSongs.json', strAllTuits);
    callback(playlist);
};
