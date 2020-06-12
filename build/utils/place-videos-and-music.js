"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var fetch = require("node-fetch");
var secondsWaiting = 5;
var millisecondsBetweenSearchs = secondsWaiting * 1000;
var networksPath = 'build/networks.json';
var slash;
var userData;
var directorySongNames;
var playList;
var fromDirectoryToPlaylistSong;
var debugLog = function (contentToLog) {
    console.log(contentToLog);
    var nameLogFile = 'debugLog.txt';
    fs_1.readFile(nameLogFile, function (err, data) {
        var newData = data ? data + "\n" + contentToLog : "" + contentToLog;
        fs_1.writeFile(nameLogFile, newData, function () {
            // Saved.
            // console.log(contentToLog);
        });
    });
};
debugLog("Copy begins...");
fs_1.readFile(networksPath, function (err, data) {
    if (err)
        throw err;
    userData = JSON.parse(data)["place-operations"];
    slash = userData["slash"];
    // Read list of folders.
    fs_1.readdir(userData["source-files-dir"], function (err, fileList) {
        if (err)
            return debugLog("Unable to scan directory: " + err);
        directorySongNames = fileList;
        // Read playlist info (it needed to related youtube with positions).
        fs_1.readFile(userData["playlist-info-file"], function (err, data) {
            if (err)
                throw err;
            playList = JSON.parse(data);
            // testMapper(); // TODO: DELETE THIS LINE, ONLY FOR TEST.
            relateDirectoriesWithSongs(extractVideoMusicAndSubtitles);
        });
    });
});
var moveFilesTo = function (filesToMove, destinyFolder, newNames) {
    filesToMove.forEach(function (oldPath, i) {
        var newPath = "" + destinyFolder + slash + newNames[i];
        fs_1.renameSync(oldPath, newPath);
        debugLog("Moved " + oldPath + " to " + newPath);
    });
};
var createFolder = function (path) {
    if (!fs_1.existsSync(path)) {
        fs_1.mkdirSync(path);
    }
    return path;
};
var buildNewOrderNameFile = function (path, order) {
    var oldName = path.split(slash);
    oldName = oldName[oldName.length - 1];
    var strOrder = (Math.floor(order / 10) === 0) ? "000" + order : ((Math.floor(order / 100) === 0) ? "00" + order : ((Math.floor(order / 1000) === 0) ? "0" + order : "" + order));
    return strOrder + " - " + oldName;
};
var musicExtensions = ['.m4a', '.ogg'];
var videoExtensions = ['.mp4', '.flv'];
var subtitlesExtensions = ['.srt'];
var extractVideoMusicAndSubtitles = function () {
    var destPathMusic = createFolder("" + userData["dest-files-dir"] + slash + "songs");
    var destPathVideoAndSub = createFolder("" + userData["dest-files-dir"] + slash + "videoclips");
    directorySongNames.forEach(function (directoryName) {
        var song = fromDirectoryToPlaylistSong[directoryName];
        if (song) {
            var songPath_1 = "" + userData["source-files-dir"] + slash + directoryName;
            fs_1.readdir(songPath_1, function (err, fileList) {
                if (err)
                    return debugLog("Unable to scan directory: " + err);
                var musicPaths = fileList.filter(function (filaName) { return filaName.indexOf(musicExtensions[0]) >= 0 || filaName.indexOf(musicExtensions[1]) >= 0; })
                    .map(function (fileName) { return "" + songPath_1 + slash + fileName; });
                var videoPaths = fileList.filter(function (filaName) { return filaName.indexOf(videoExtensions[0]) >= 0 || filaName.indexOf(videoExtensions[1]) >= 0; })
                    .map(function (fileName) { return "" + songPath_1 + slash + fileName; });
                var subtitlesPaths = fileList.filter(function (filaName) { return filaName.indexOf(subtitlesExtensions[0]) >= 0; })
                    .map(function (fileName) { return "" + songPath_1 + slash + fileName; });
                var musicNewNames = musicPaths.map(function (filePath) { return buildNewOrderNameFile(filePath, song.position); });
                var videoNewNames = videoPaths.map(function (filePath) { return buildNewOrderNameFile(filePath, song.position); });
                var subtitlesNewNames = subtitlesPaths.map(function (filePath) { return buildNewOrderNameFile(filePath, song.position); });
                moveFilesTo(musicPaths, destPathMusic, musicNewNames);
                moveFilesTo(videoPaths, destPathVideoAndSub, videoNewNames);
                moveFilesTo(subtitlesPaths, destPathVideoAndSub, subtitlesNewNames);
            });
        }
        else {
            debugLog("ERROR: The song " + directoryName + " isn't in playlist!");
        }
    });
};
var relateDirectoriesWithSongs = function (onRelatedFinished) {
    fromDirectoryToPlaylistSong = {};
    setYoutubeNameSong(playList[0], onRelatedFinished);
};
var setYoutubeNameSong = function (song, onRelatedFinished, indexSong) {
    if (indexSong === void 0) { indexSong = 0; }
    fetch(song.youtubeUrl)
        .then(function (response) {
        return response.text();
    }).then(function (response) {
        var videoTitle = extractTitle(response);
        if (!videoTitle) {
            repeatCallingToYoutube(song, onRelatedFinished, indexSong);
            return;
        }
        debugLog("Getted song '" + song.toSearch + "'");
        fromDirectoryToPlaylistSong[clearNotAllowedCharacters(videoTitle)] = song;
        if (indexSong + 1 >= playList.length) {
            onRelatedFinished();
        }
        else {
            setTimeout(function () { return setYoutubeNameSong(playList[indexSong + 1], onRelatedFinished, indexSong + 1); }, millisecondsBetweenSearchs);
        }
    });
};
var repeatCallingToYoutube = function (song, onRelatedFinished, indexSong) {
    if (indexSong === void 0) { indexSong = 0; }
    debugLog("Error in search petition... Trying again in " + secondsWaiting + " seconds.");
    setTimeout(function () { return setYoutubeNameSong(song, onRelatedFinished, indexSong); }, millisecondsBetweenSearchs);
};
var youtubeTitleFinalMark = " - YouTube";
var extractTitle = function (contentHTML) {
    var title = undefined;
    if (contentHTML) {
        var parcialTitle = contentHTML.split('<title>');
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
};
var clearNotAllowedCharacters = function (strWithRareCharacters) {
    if (userData["useWindowsFileFilter"]) {
        var notAllowedCharacters = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
        var toPut_1 = "_";
        var finalStr_1 = strWithRareCharacters;
        notAllowedCharacters.forEach(function (c) { return finalStr_1 = replaceAll(finalStr_1, c, toPut_1); });
        return finalStr_1;
    }
    else {
        return strWithRareCharacters;
    }
};
var replaceAll = function (word, toReplace, toPut) {
    return word.split(toReplace).join(toPut);
};
// ********************************************************************************
// ****************************** FOR TESTING!! ***********************************
// ********************************************************************************
var saveInformation = function (nameFile, content) {
    fs_1.writeFileSync(nameFile, content);
};
var testMapper = function () {
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
    ];
};
