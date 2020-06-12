import { readFile, readdir, writeFileSync, existsSync, mkdirSync, renameSync, writeFile } from 'fs';
import { PlaylistSong } from '../spotify-get-playlist';
const fetch = require("node-fetch");

const secondsWaiting = 5;
const millisecondsBetweenSearchs = secondsWaiting * 1000;
const networksPath = 'build/networks.json';

let slash: string;
let userData: any;
let directorySongNames: string[];
let playList: PlaylistSong[];
let fromDirectoryToPlaylistSong: {
    [key: string]: PlaylistSong;
};

const debugLog = (contentToLog: any) => {
    console.log(contentToLog);
    const nameLogFile = 'debugLog.txt';
    readFile(nameLogFile, (err, data) => {
        const newData = data ? `${data}\n${contentToLog}` : `${contentToLog}`;
        writeFile(nameLogFile, newData, () => {
            // Saved.
            // console.log(contentToLog);
        });
    })
}

debugLog("Copy begins...");

readFile(networksPath, (err, data) => {
    if (err) throw err;
    userData = JSON.parse(<string> <any> data)["place-operations"];
    slash = userData["slash"];
    // Read list of folders.
    readdir(userData["source-files-dir"], (err, fileList: string[]) => {
        if (err) return debugLog(`Unable to scan directory: ${err}`);
        directorySongNames = fileList;

        // Read playlist info (it needed to related youtube with positions).
        readFile(userData["playlist-info-file"], (err, data) => {
            if (err) throw err;
            playList = <PlaylistSong[]> JSON.parse(<string> <any> data);
            // testMapper(); // ONLY ENABLE THIS FOR DO SOME TEST.
            relateDirectoriesWithSongs(extractVideoMusicAndSubtitles);
        });
    });
});

const moveFilesTo = (filesToMove: string[], destinyFolder: string, newNames: string[]) => {
    filesToMove.forEach((oldPath, i) => {
        const newPath = `${destinyFolder}${slash}${newNames[i]}`;
        renameSync(oldPath, newPath);
        debugLog(`Moved ${oldPath} to ${newPath}`);
    });
}

const createFolder = (path: string): string => {
    if (!existsSync(path)){
        mkdirSync(path);
    }
    return path;
}

const buildNewOrderNameFile = (path: string, order: number) => {
    let oldName: string | string[] = path.split(slash);
    oldName = oldName[oldName.length - 1];
    const strOrder = (Math.floor(order/10) === 0) ? `000${order}` : (
        (Math.floor(order/100) === 0) ? `00${order}` : (
            (Math.floor(order/1000) === 0) ? `0${order}` : `${order}`
        )
    );
    return `${strOrder} - ${oldName}`;
}

const musicExtensions = [ '.m4a', '.ogg'];
const videoExtensions = ['.mp4', '.flv'];
const subtitlesExtensions = ['.srt'];

const extractVideoMusicAndSubtitles = () => {
    const destPathMusic = createFolder(`${userData["dest-files-dir"]}${slash}songs`);
    const destPathVideoAndSub = createFolder(`${userData["dest-files-dir"]}${slash}videoclips`);

    directorySongNames.forEach(directoryName => {
        const song = fromDirectoryToPlaylistSong[directoryName];
        if (song) {
            const songPath = `${userData["source-files-dir"]}${slash}${directoryName}`;
            readdir(songPath, (err, fileList: string[]) => {
                if (err) return debugLog(`Unable to scan directory: ${err}`);

                const musicPaths = fileList.filter(filaName => filaName.indexOf(musicExtensions[0]) >= 0 || filaName.indexOf(musicExtensions[1]) >= 0)
                    .map(fileName => `${songPath}${slash}${fileName}`);
                const videoPaths = fileList.filter(filaName => filaName.indexOf(videoExtensions[0]) >= 0 || filaName.indexOf(videoExtensions[1]) >= 0)
                    .map(fileName => `${songPath}${slash}${fileName}`);
                const subtitlesPaths = fileList.filter(filaName => filaName.indexOf(subtitlesExtensions[0]) >= 0)
                    .map(fileName => `${songPath}${slash}${fileName}`);

                const musicNewNames = musicPaths.map(filePath => buildNewOrderNameFile(filePath, song.position));
                const videoNewNames = videoPaths.map(filePath => buildNewOrderNameFile(filePath, song.position));
                const subtitlesNewNames = subtitlesPaths.map(filePath => buildNewOrderNameFile(filePath, song.position));

                moveFilesTo(musicPaths, destPathMusic, musicNewNames);
                moveFilesTo(videoPaths, destPathVideoAndSub, videoNewNames);
                moveFilesTo(subtitlesPaths, destPathVideoAndSub, subtitlesNewNames);
            });
        } else {
            debugLog(`ERROR: The song ${directoryName} isn't in playlist!`);
        }
    });
}

const relateDirectoriesWithSongs = (onRelatedFinished: () => void) => {
    fromDirectoryToPlaylistSong = {};
    setYoutubeNameSong(playList[0], onRelatedFinished);
}

const setYoutubeNameSong = (song: PlaylistSong, onRelatedFinished: () => void, indexSong = 0) => {
    fetch(song.youtubeUrl)
        .then((response: any) => {
            return response.text();
        }).then((response: any) => {
            const videoTitle = extractTitle(<string> response);
            if (!videoTitle) {
                repeatCallingToYoutube(song, onRelatedFinished, indexSong);
                return;
            }
            debugLog(`Getted song \'${song.toSearch}\'`);
            fromDirectoryToPlaylistSong[clearNotAllowedCharacters(videoTitle)] = song;

            if (indexSong + 1 >= playList.length) {
                onRelatedFinished();
            } else {
                setTimeout(
                    () => setYoutubeNameSong(playList[indexSong + 1], onRelatedFinished, indexSong + 1),
                    millisecondsBetweenSearchs
                );
            }
        });
}

const repeatCallingToYoutube = (song: PlaylistSong, onRelatedFinished: () => void, indexSong = 0) => {
    debugLog(`Error in search petition... Trying again in ${secondsWaiting} seconds.`);
    setTimeout(
        () => setYoutubeNameSong(song, onRelatedFinished, indexSong),
        millisecondsBetweenSearchs
    );
}

const youtubeTitleFinalMark = " - YouTube";

const extractTitle = (contentHTML: string): string | undefined => {
    let title = undefined;
    if (contentHTML) {
        let parcialTitle: string | string[] = contentHTML.split('<title>');
        if (parcialTitle) {
            parcialTitle = parcialTitle[1];
            if (parcialTitle) {
                parcialTitle = parcialTitle.split('</title>');
                if (parcialTitle) {
                    parcialTitle = parcialTitle[0];
                    if (parcialTitle.indexOf(youtubeTitleFinalMark) >= 0) {
                        title = parcialTitle.replace(youtubeTitleFinalMark, "");
                    }
                }
            }
        }
    }
    return title;
}

const clearNotAllowedCharacters = (strWithRareCharacters: string) => {
    if (userData["useWindowsFileFilter"]) {
        const notAllowedCharacters = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
        const toPut = "_";
        let finalStr = strWithRareCharacters;
        notAllowedCharacters.forEach(c => finalStr = replaceAll(finalStr, c, toPut));
        return finalStr;
    } else {
        return strWithRareCharacters;
    }
}

const replaceAll = (word: string, toReplace: string, toPut: string): string => {
    return word.split(toReplace).join(toPut);
}

// ********************************************************************************
// ****************************** FOR TESTING!! ***********************************
// ********************************************************************************

const saveInformation = (nameFile: string, content: any) => {
    writeFileSync(nameFile, content);
}

const testMapper = () => {
    directorySongNames = ['[ESTRENO] FLORES RARAS - FLORES ROTAS', 'A_Teens - Mamma Mia', 'Aaliyah - Try Again (HD)'];
    playList = [
        {
          "position": 56,
          "toSearch": "A*Teens Mamma Mia - Radio Version",
          "youtubeUrl": "https://www.youtube.com/watch?v=sPalTdUyzss"
        },
        {
          "position": 57,
          "toSearch": "Aaliyah Try Again",
          "youtubeUrl": "https://www.youtube.com/watch?v=aRcAvsZgjXA"
        },
        {
          "position": 135,
          "toSearch": "Flores Raras Flores Rotas",
          "youtubeUrl": "https://www.youtube.com/watch?v=QvzGa_P39RI"
        },
    ]
}
