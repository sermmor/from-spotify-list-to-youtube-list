"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var spotify_get_playlist_1 = require("./spotify-get-playlist");
var playlist_youtube_1 = require("./playlist-youtube");
var networksPath = 'build/networks.json';
var userData;
fs_1.readFile(networksPath, function (err, data) {
    if (err)
        throw err;
    userData = JSON.parse(data);
    spotify_get_playlist_1.getTheSpotifyPlaylist(userData, function (playlist) {
        // FIXME: EL PROBLEMA DE ESTO ES QUE LA API DE YOUTUBE DA A ERROR POR LÍMITE DIARIO EXCEDIDO.
        // ASÍ QUE TANTO PARA SALVAR EN UN FICHERO COMO PARA HACER PLAYLIST (EN TEORÍA SON 10.000 LLAMADAS DIARIAS PEERO...)
        playlist_youtube_1.youtubePlaylist(userData, playlist, function (playlistCompleted) {
            spotify_get_playlist_1.savePlaylistResultInFile(playlistCompleted, function (playlistSaved) {
                console.log(playlist);
            });
        });
    });
    // youtubePlaylist(userData,
    //     [
    //         {
    //             "position": 0,
    //             "toSearch": "Joan Jett & The Blackhearts Shout",
    //             "youtubeUrl": '',
    //         },
    //         {
    //           "position": 1,
    //           "toSearch": "The Sonics Have Love Will Travel",
    //           "youtubeUrl": '',
    //         },
    //         {
    //           "position": 2,
    //           "toSearch": "Queen Tutti Frutti - Live At Wembley Stadium / July 1986",
    //           "youtubeUrl": '',
    //         },
    //     ],
    //     (playlist: PlaylistSong[]) => {
    //         console.log(playlist);
    //     }
    // );
});
