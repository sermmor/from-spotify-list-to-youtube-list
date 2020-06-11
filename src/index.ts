import { readFile } from 'fs';
import { getTheSpotifyPlaylist, PlaylistSong, savePlaylistResultInFile, savePlaylistAndUrlsResultInFiles } from './spotify-get-playlist';
import { youtubePlaylist } from './playlist-youtube';

const networksPath = 'build/networks.json';
let userData: any;

console.log("Application begins...");

readFile(networksPath, (err, data) => {
    if (err) throw err;
    userData = JSON.parse(<string> <any> data);
    
    getTheSpotifyPlaylist(userData, (playlist: PlaylistSong[]) => {
        youtubePlaylist(userData, playlist, (playlistCompleted: PlaylistSong[]) => {
            savePlaylistAndUrlsResultInFiles(playlistCompleted, playlistSaved => {
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
    //           "position": 107,
    //           "toSearch": "Gyroscope Baby, I’m Gettin’ Better",
    //           "youtubeUrl": ""
    //         },
    //         {
    //           "position": 2,
    //           "toSearch": "Queen Tutti Frutti - Live At Wembley Stadium / July 1986",
    //           "youtubeUrl": '',
    //         },
    //     ],
    //     (playlist: PlaylistSong[]) => {
    //         // savePlaylistAndUrlsResultInFiles(playlist, playlistSaved => {
    //             console.log(playlist);
    //         // });
    //     }
    // );
});
