import { readFile } from 'fs';
import { getTheSpotifyPlaylist, PlaylistSong, savePlaylistResultInFile } from './spotify-get-playlist';
import { youtubePlaylist } from './playlist-youtube';

const networksPath = 'build/networks.json';
let userData: any;

readFile(networksPath, (err, data) => {
    if (err) throw err;
    userData = JSON.parse(<string> <any> data);
    
    getTheSpotifyPlaylist(userData, (playlist: PlaylistSong[]) => {
        // FIXME: EL PROBLEMA DE ESTO ES QUE LA API DE YOUTUBE DA A ERROR POR LÍMITE DIARIO EXCEDIDO.
        // ASÍ QUE TANTO PARA SALVAR EN UN FICHERO COMO PARA HACER PLAYLIST (EN TEORÍA SON 10.000 LLAMADAS DIARIAS PEERO TE DEJA MENOS DE 100 ¬¬)
        youtubePlaylist(userData, playlist, (playlistCompleted: PlaylistSong[]) => {
            savePlaylistResultInFile(playlistCompleted, playlistSaved => {
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
