import { writeFileSync } from 'fs';

const SpotifyWebApi = require('spotify-web-api-node');

let spotifyApi: any;
let spotifyUserData: any;

export interface PlaylistSong {
    position: number;
    toSearch: string;
    youtubeUrl: string;
}

export const getTheSpotifyPlaylist = (userData: any, callback: (playlist: PlaylistSong[]) => void) => {
    spotifyUserData = userData["spotify"];
    spotifyApi = new SpotifyWebApi({
        clientId: spotifyUserData["clientId"],
        clientSecret: spotifyUserData["clientSecret"],
        redirectUri: spotifyUserData["redirectUri"],
    });

    if (spotifyUserData["getNewKeyApi"]) {
        generateNewAutorizeUrl();
    } else {
        launchAuthorizationProcessOrMain(callback);
    }
}

const generateNewAutorizeUrl = () => {
    const scopes = ['user-read-private', 'user-read-email'];
    const state = 'some-state-of-my-choice';
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    console.log("Copy the following url and paste in your browser so the callback url paste in networks.json (section 'urlCallback'), in the next call you can paste the access_token in networks.json.");
    console.log(authorizeURL);
}

const launchAuthorizationProcessOrMain = (callback: (playlist: PlaylistSong[]) => void) => {
    if (spotifyUserData["access_token"]) {
        spotifyApi.setAccessToken(spotifyUserData["access_token"]);
        main(callback);
    } else {
        const urlCallback = spotifyUserData["urlCallback"];
        const code = urlCallback.split('code=')[1].split('&state')[0];
        spotifyApi.authorizationCodeGrant(code).then((data: any) => {
              console.log('The token expires in ' + data.body['expires_in']);
              console.log('The access token is ' + data.body['access_token']);
              console.log('The refresh token is ' + data.body['refresh_token']);
           
              // Set the access token on the API object to use it in later calls
              spotifyUserData["access_token"] = data.body['access_token'];
              spotifyApi.setAccessToken(data.body['access_token']);
              spotifyApi.setRefreshToken(data.body['refresh_token']);
    
              main(callback);
            },
            (err: any) => {
              console.log('Something went wrong!', err);
            }
          );
    }
}

const allSongsPlaylist: PlaylistSong[] = [];

const main = (callback: (playlist: PlaylistSong[]) => void, offset: number = 0) => {
    let numberTrack = offset;
    spotifyApi.getPlaylistTracks(spotifyUserData["playlistId"], {
        offset,
        fields: 'items'
      })
      .then(
        function(data: any) {
            if (!data.body || !data.body["items"] || data.body["items"].length === 0) {
                savePlaylistResultInFile(allSongsPlaylist, callback);
                return;
            }
            data.body["items"].forEach((item: any) => {
                const track = item["track"];
                allSongsPlaylist.push({
                    position: numberTrack,
                    toSearch: `${track["artists"][0]["name"]} ${track["name"]}`,
                    youtubeUrl: '',
                });
                numberTrack++;
            });

            setTimeout(() => main(callback, numberTrack), 0);
        },
        function(err: any) {
          console.log('Something went wrong!', err);
        }
      );
}

export const savePlaylistResultInFile = (playlist: PlaylistSong[], callback: (playlist: PlaylistSong[]) => void) => {
    const strAllTuits: string = JSON.stringify(playlist, null, 2);
    writeFileSync('playlistSongs.json', strAllTuits);
    callback(playlist);
}
