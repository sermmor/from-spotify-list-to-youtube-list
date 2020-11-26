"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var networksPath = 'build/networks.json';
var slash;
var userData;
var barrier = 0;
var totalFilesPathFrom = [];
var totalFilesPathTo = [];
console.log("> Copy begins...");
fs_1.readFile(networksPath, function (err, data) {
    if (err)
        throw err;
    userData = JSON.parse(data)["copy-in-order"];
    slash = userData["slash"];
    // Read list of folders.
    fs_1.readdir(userData["from"], function (err, folderList) {
        if (err)
            return console.log("> Unable to scan directory: " + err);
        barrier = folderList.length;
        folderList.forEach(function (nameFolder) {
            copyFolder(nameFolder, "" + userData["from"] + slash + nameFolder);
        });
    });
});
var copyFolder = function (nameFolder, pathFolder) {
    fs_1.readdir(pathFolder, function (err, fileList) {
        console.log("> Copy folder " + pathFolder);
        if (err)
            return console.log("> Unable to scan directory: " + err);
        var filePathFrom = fileList.map(function (nameFile) { return "" + pathFolder + slash + nameFile; });
        var filePathTo = fileList.map(function (nameFile) { return "" + userData["to"] + slash + nameFolder + slash + nameFile; });
        var folderTo = "" + userData["to"] + slash + nameFolder;
        fs_1.exists(folderTo, function (err) {
            if (!err) {
                console.log("> Creating folder " + folderTo);
                fs_1.mkdir(folderTo, function (err) {
                    console.log("> Created folder " + folderTo);
                    totalFilesPathFrom = totalFilesPathFrom.concat(filePathFrom);
                    totalFilesPathTo = totalFilesPathTo.concat(filePathTo);
                    barrier--;
                    if (barrier <= 0) {
                        totalFilesPathFrom.sort();
                        totalFilesPathTo.sort();
                        copyFilesInOrder(totalFilesPathFrom, totalFilesPathTo);
                    }
                });
            }
            else {
                console.log("> Folder " + folderTo + " already created");
                totalFilesPathFrom = totalFilesPathFrom.concat(filePathFrom);
                totalFilesPathTo = totalFilesPathTo.concat(filePathTo);
                barrier--;
                if (barrier <= 0) {
                    totalFilesPathFrom.sort();
                    totalFilesPathTo.sort();
                    copyFilesInOrder(totalFilesPathFrom, totalFilesPathTo);
                }
            }
        });
    });
};
var copyFilesInOrder = function (filesPathFrom, filesPathTo) {
    console.log("> Copy begins...");
    if (filesPathFrom.length != filesPathTo.length) {
        console.log("> There's an error with the paths!");
    }
    else if (filesPathFrom.length <= 0) {
        console.log("> Copy FINISHED!!! :D");
    }
    else {
        console.log("> Copy the file " + filesPathFrom[0] + " to the path " + filesPathTo[0]);
        fs_1.copyFile(filesPathFrom[0], filesPathTo[0], function (err) {
            if (err) {
                console.log("> It was an error when it's copy the file " + filesPathFrom[0] + " to the path " + filesPathTo[0]);
            }
            setTimeout(function () { return copyFilesInOrder(filesPathFrom.slice(1), filesPathTo.slice(1)); }, 0);
        });
    }
};
