/* replace all absolute imports to relative in "src" directory */
const FileSystem = require("fs");

const rootFolder = "src";
const srcFolders = [
    "bootstrap",
    "components",
    "core",
    "hoc",
    "hooks",
    "shared",
    "store",
    "theme",
];

const rootFolderRegExp = new RegExp(`.*${rootFolder}/`);
const importRegExp = new RegExp(`(from (?:'|"))(${srcFolders.join("|")})(\\S*(?:'|");$)`, "mg");

(async function main() {
    const filePaths = await getFilePaths(`./${rootFolder}`);

    await Promise.all(filePaths.map((filePath) => {
        return replaceImports(filePath);
    }));
})();

async function replaceImports(filePath) {
    const folderDepth = filePath.replace(rootFolderRegExp, "").split("/").length - 1;
    const fileContent = await readFile(filePath);

    const replacedFileContent = fileContent.replace(importRegExp, absoluteToRelative);

    if (replacedFileContent !== fileContent) {
        console.info("replace imports: ", filePath);

        await writeFile(filePath, replacedFileContent);
    }

    function absoluteToRelative(_, strStart, importedFolderName, strEnd) {
        const folderPath = "../".repeat(folderDepth) + importedFolderName;

        return `${strStart}${folderPath}${strEnd}`;
    }
}

async function getFilePaths(path, filePaths = []) {
    let dirEntries;

    try {
        dirEntries = await readFolder(path);
    } catch (error) {
        console.error(error);
    }

    for (const dirEntry of dirEntries) {
        const entryPath = `${path}/${dirEntry.name}`;

        if (dirEntry.isDirectory()) {
            await getFilePaths(entryPath, filePaths);
        } else {
            filePaths.push(entryPath);
        }
    }

    return filePaths;
}

function writeFile(filePath, content) {
    // console.info("writeFile: ", filePath);

    return new Promise((resolve, reject) => {
        FileSystem.writeFile(filePath, content, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function readFile(filePath, options) {
    // console.info("readFile: ", filePath);

    return new Promise((resolve, reject) => {
        FileSystem.readFile(filePath, options, (error, content) => {
            if (error) {
                reject(error);
            } else {
                resolve(content.toString());
            }
        });
    });
}

function readFolder(path) {
    return new Promise((resolve, reject) => {
        FileSystem.readdir(path, { withFileTypes: true }, (error, dirEntries) => {
            if (error) {
                reject(error);
            } else {
                resolve(dirEntries);
            }
        });
    });
}
