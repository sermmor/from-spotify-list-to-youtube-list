import { youtube_v3 } from "googleapis";
import { PlaylistSong } from "./spotify-get-playlist";
import { writeFileSync } from "fs";

const fetch = require("node-fetch");

const secondsWaiting = 5;
const millisecondsBetweenSearchs = secondsWaiting * 1000;

let youtubeApi: any;
let youtubeUserData: any;

export const youtubePlaylist = (userData: any, playlist: PlaylistSong[], callback: (playlist: PlaylistSong[]) => void) => {
    console.log(`Youtube searching begins...`);
    youtubeUserData = userData["youtube"];

    setTimeout(() => searchInYoutube(playlist, callback), 0);

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
}

const keyUrlGetter = 'href="/watch?';
const genericUrlYoutubeVideo = "https://www.youtube.com/watch?";//"https://www.youtube.com/watch?v=";
const againstPlaylistSearches = "&sp=EgIQAQ%253D%253D";

const searchInYoutube = (
    playlist: PlaylistSong[],
    callback: (playlist: PlaylistSong[]) => void,
    index = 0,
) => {
    const queryToSearch = formatQuery(playlist[index].toSearch);
    fetch(`https://www.youtube.com/results?search_query=${queryToSearch}${againstPlaylistSearches}`)
        .then((response: any) => {
            // console.log(response);
            return response.text();
        }).then((response: any) => {
            const keyIdUrlVideo = getYoutubeIdKeyOfFirstVideoResult(<string> response);
            if (!keyIdUrlVideo) {
                repeatCallingToYoutube(playlist, callback, index);
                return;
            }
            playlist[index].youtubeUrl = `${genericUrlYoutubeVideo}${keyIdUrlVideo}`;

            console.log(`Searched ${queryToSearch}: ${playlist[index].youtubeUrl}`);

            callToYoutubeNextSongInPlaylist(playlist, callback, index);
        }).catch((error: any) => {
            console.log(`ERROR: INCORRECT query ${queryToSearch}.`);
            playlist[index].youtubeUrl = `ERROR WITH QUERY \'${queryToSearch}\'`;
            callToYoutubeNextSongInPlaylist(playlist, callback, index);
        });
}

const getYoutubeIdKeyOfFirstVideoResult = (response: string): string | undefined => {
    let idKeyVideo = undefined;
    if (response && response.split) {
        let keyBegins: string[] | string = response.split(keyUrlGetter);
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
}

const repeatCallingToYoutube = (
    playlist: PlaylistSong[],
    callback: (playlist: PlaylistSong[]) => void,
    index = 0,
) => {
    console.log(`Error in search petition... Trying again in ${secondsWaiting} seconds.`);
    setTimeout(
        () => searchInYoutube(playlist, callback, index),
        millisecondsBetweenSearchs
    );
}

const callToYoutubeNextSongInPlaylist = (
    playlist: PlaylistSong[],
    callback: (playlist: PlaylistSong[]) => void,
    index = 0,
) => {
    if (index + 1 < playlist.length) {
        console.log(`Waiting ${secondsWaiting} seconds to the next search.`);
        setTimeout(
            () => searchInYoutube(playlist, callback, index + 1),
            millisecondsBetweenSearchs
        );
    } else {
        console.log("Search ended");
        callback(playlist);
    }
}

const formatQuery = (toSearch: string): string => {
    const splitedSearch = toSearch.split(" ");
    // const formatedSplitedSearch = splitedSearch.map(word => encodeURI(formatWordQuery(word)));
    const formatedSplitedSearch = splitedSearch.map(word => formatWordQuery(word));
    console.log(formatedSplitedSearch.join('+'))
    return formatedSplitedSearch.join('+');
}

const formatWordQuery = (word: string): string => {
    const firstReplace =  word.replace(/&/g, "%26").replace(/>/g, "").replace(/</g, "").replace(/"/g, "")
        .replace(/'/g, "").replace(/-/g, "+").replace(/á/gi, "a").replace(/é/gi, "e").replace(/í/gi, "i")
        .replace(/ó/gi, "o").replace(/ú/gi, "u").replace(/à/gi, "a").replace(/è/gi, "e").replace(/ì/gi, "i")
        .replace(/ò/gi, "o").replace(/ù/gi, "u").replace(/ä/gi, "a").replace(/ë/gi, "e").replace(/ï/gi, "i")
        .replace(/ö/gi, "o").replace(/ü/gi, "u").replace(/â/gi, "a").replace(/ê/gi, "e").replace(/î/gi, "i")
        .replace(/ô/gi, "o").replace(/û/gi, "u").replace(/’/g, "").replace(/:/g, "+").replace(/{/g, "")
        .replace(/}/g, "").replace(/,/g, "+").replace(/;/g, "+");

    return simplifySeparatorBetweenQueryWords(replaceAll(replaceAll(
            replaceAll(replaceAll(replaceAll(replaceAll(firstReplace, "/", "+"), "(", ""), "[", ""), ")", ""),
            "]", ""), ".", "+"));
}

const replaceAll = (word: string, toReplace: string, toPut: string): string => {
    return word.split(toReplace).join(toPut);
}

const simplifySeparatorBetweenQueryWords = (word: string): string => {
    return word.split('+').reduce((acc, current) => (current === "") ? acc : `${acc}+${current}`);
}

const searchInYoutubeAPI = (
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
