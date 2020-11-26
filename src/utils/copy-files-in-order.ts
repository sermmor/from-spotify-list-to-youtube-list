import { readFile, readdir, exists, mkdir, copyFile } from "fs";

const networksPath = 'build/networks.json';
let slash: string;
let userData: any;
let barrier = 0;
let totalFilesPathFrom: string[] = [];
let totalFilesPathTo: string[] = [];

console.log("> Copy begins...");

readFile(networksPath, (err, data) => {
    if (err) throw err;
    userData = JSON.parse(<string> <any> data)["copy-in-order"];
    slash = userData["slash"];
    // Read list of folders.
    readdir(userData["from"], (err, folderList: string[]) => {
        if (err) return console.log(`> Unable to scan directory: ${err}`);
        barrier = folderList.length;
        folderList.forEach((nameFolder: string) => {
            copyFolder(nameFolder, `${userData["from"]}${slash}${nameFolder}`);
        });
    });
});

const copyFolder = (nameFolder: string, pathFolder: string) => {
    readdir(pathFolder, (err, fileList: string[]) => {
        console.log(`> Copy folder ${pathFolder}`);
        if (err) return console.log(`> Unable to scan directory: ${err}`);
        const filePathFrom = fileList.map((nameFile) => `${pathFolder}${slash}${nameFile}`);
        const filePathTo = fileList.map((nameFile) => `${userData["to"]}${slash}${nameFolder}${slash}${nameFile}`);
        const folderTo = `${userData["to"]}${slash}${nameFolder}`;

        exists(folderTo, (err) => {
            if (!err) {
                console.log(`> Creating folder ${folderTo}`);
                mkdir(folderTo, (err) => {
                    console.log(`> Created folder ${folderTo}`);
                    totalFilesPathFrom = totalFilesPathFrom.concat(filePathFrom);
                    totalFilesPathTo = totalFilesPathTo.concat(filePathTo);
                    barrier--;
                    if (barrier <= 0) {
                        totalFilesPathFrom.sort();
                        totalFilesPathTo.sort();
                        copyFilesInOrder(totalFilesPathFrom, totalFilesPathTo);
                    }
                });
            } else {
                console.log(`> Folder ${folderTo} already created`);
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
}

const copyFilesInOrder = (filesPathFrom: string[], filesPathTo: string[]) => {
    console.log("> Copy begins...");
    if (filesPathFrom.length != filesPathTo.length) {
        console.log("> There's an error with the paths!");
    } else if (filesPathFrom.length <= 0) {
        console.log("> Copy FINISHED!!! :D");
    } else {
        console.log(`> Copy the file ${filesPathFrom[0]} to the path ${filesPathTo[0]}`);
        copyFile(filesPathFrom[0], filesPathTo[0], (err) => {
            if (err) {
                console.log(`> It was an error when it's copy the file ${filesPathFrom[0]} to the path ${filesPathTo[0]}`);
            }
            setTimeout(() => copyFilesInOrder(filesPathFrom.slice(1), filesPathTo.slice(1)), 0);
        });
    }
    
}