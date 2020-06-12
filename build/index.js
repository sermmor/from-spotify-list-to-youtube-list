"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var spotify_get_playlist_1 = require("./spotify-get-playlist");
var youtube_songs_searcher_1 = require("./youtube-songs-searcher");
var networksPath = 'build/networks.json';
var userData;
console.log("Application begins...");
fs_1.readFile(networksPath, function (err, data) {
    if (err)
        throw err;
    userData = JSON.parse(data);
    spotify_get_playlist_1.getTheSpotifyPlaylist(userData, function (playlist) {
        youtube_songs_searcher_1.youtubePlaylist(userData, playlist, function (playlistCompleted) {
            spotify_get_playlist_1.savePlaylistAndUrlsResultInFiles(playlistCompleted, function (playlistSaved) {
                // console.log(playlist);
            });
        });
    });
    // test();
});
var test = function () {
    youtube_songs_searcher_1.youtubePlaylist(userData, [
        {
            "position": 0,
            "toSearch": "Joan Jett & The Blackhearts Shout",
            "youtubeUrl": '',
        },
        {
            "position": 1,
            "toSearch": "The Sonics Have Love Will Travel",
            "youtubeUrl": '',
        },
        {
            "position": 107,
            "toSearch": "Gyroscope Baby, I’m Gettin’ Better",
            "youtubeUrl": ""
        },
        {
            "position": 2,
            "toSearch": "Queen Tutti Frutti - Live At Wembley Stadium / July 1986",
            "youtubeUrl": '',
        },
        {
            "position": 132,
            "toSearch": "Run–D.M.C. Rock Box",
            "youtubeUrl": ""
        },
    ], function (playlist) {
        // savePlaylistAndUrlsResultInFiles(playlist, playlistSaved => {
        console.log(playlist);
        // });
    });
};
