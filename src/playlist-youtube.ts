import { youtube_v3 } from "googleapis";
import { PlaylistSong } from "./spotify-get-playlist";

const millisecondsBetweenSearchs = 5 * 1000;

let youtubeApi: any;
let youtubeUserData: any;

export const youtubePlaylist = (userData: any, playlist: PlaylistSong[], callback: (playlist: PlaylistSong[]) => void) => {
    console.log(`Youtube searching begins...`);
    youtubeUserData = userData["youtube"];
    
    youtubeApi = new youtube_v3.Youtube({auth: youtubeUserData["keyAPI"]});
    const opts = {
        maxResults: 1,
      };

    let timeToSearch = 0;
    for (let i = 0; i < playlist.length; i++) {
        const { toSearch } = playlist[i];
        setTimeout(() => searchInYoutube(toSearch, opts, playlist, i, callback), timeToSearch);
        timeToSearch += millisecondsBetweenSearchs;
    }
}

const searchInYoutube = (
    toSearch: string,
    opts: {maxResults: number},
    playlist: PlaylistSong[],
    index: number,
    callback: (playlist: PlaylistSong[]) => void
) => {
    youtubeApi.search.list({
        part: 'id',
        type: 'video',
        q: toSearch,
        order: 'relevance',
        safeSearch: 'none',
        maxResults: opts.maxResults,
        videoEmbeddable: 'any'
    }, (err: any, response: any) => {
        if(err) return console.log(err);

        const videoId = response["data"]["items"][0]["id"]["videoId"];
        playlist[index].youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

        console.log(`Got youtube song \"${toSearch}\" ( ${playlist[index].youtubeUrl} )`);
        
        if (index === playlist.length - 1) {
            callback(playlist);
        }
    });
}
