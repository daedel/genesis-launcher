import { BaseDirectory, exists, readDir, createDir, FileEntry } from '@tauri-apps/api/fs';
import { GAME_FOLDER } from './consts';
import { getHttpClient } from './httpClient';
import { invoke } from '@tauri-apps/api';

type StringDictionary = {
    [key: string]: string;
};

type HashInfo = {
    [key: string]: {
        base: boolean;
        hash: string;
        path: string;
    };
};

type FileInfo = {
    file_name: string;
    path: string;
};

export interface FilesNeedsUpdate {
    [key: string]: String[];
}

const mergeChildren = (gameFiles: FileEntry[]): StringDictionary => {
    let mergedList: StringDictionary = {};

    function recursiveMerge(entries: FileEntry[]) {
        for (const entry of entries) {
            if (entry.children) {
                recursiveMerge(entry.children);
            } else {
                if (entry.name) {
                    mergedList[entry.name] = entry.path;
                }
            }
        }
    }
    recursiveMerge(gameFiles);
    return mergedList;

}

const getFilesNeedsUpdate = async () => {
    await check_game_dir_exists();
    return await checkFilesNeedsUpdate();

}

const check_game_dir_exists = async () => {
    const game_dir_exists = await exists(GAME_FOLDER, { dir: BaseDirectory.Resource });
    if (game_dir_exists === false) {
        await createDir(GAME_FOLDER, { dir: BaseDirectory.Resource });
    }
};

const getFileHashes = async (): Promise<HashInfo> => {
    const HTTP = await getHttpClient();
    const response = await HTTP.get('uo_files/hashes/');
    return response.data;
}

const checkFilesInFolderThatNeedUpdate = async (gameFiles: StringDictionary, hashes: HashInfo): Promise<FileInfo[]> => {
    let filesNeedsUpdate: FileInfo[] = [];
    console.log(hashes);
    for (const fileName in hashes) {
        //check if path is direcrory
        const hashInfo = hashes[fileName];

        if (fileName in gameFiles) {
            if (hashInfo.base) {
                const diskFileHash = await invoke<string>('calculate_sha256', { filePath: gameFiles[fileName] });
                console.log('diskFileHash: ', diskFileHash);

                const remoteHash = hashes[fileName].hash;
                if (diskFileHash !== remoteHash) {
                    console.log('File needs update: ', fileName);
                    console.log('diskFileHash: ', diskFileHash);
                    console.log('remoteHash: ', remoteHash);

                    filesNeedsUpdate.push({ file_name: fileName, path: hashInfo.path });
                };
            }

        } else {
            filesNeedsUpdate.push({ file_name: fileName, path: hashInfo.path });
        }

    }
    return filesNeedsUpdate;
}

const checkFilesNeedsUpdate = async (): Promise<FileInfo[]> => {
    const gameFiles = await readDir(GAME_FOLDER, { dir: BaseDirectory.Resource, recursive: true });
    const allLocalGameFiles = mergeChildren(gameFiles);
    // const allFiles = await readDir(CUO_FOLDER, { dir: BaseDirectory.Resource, recursive: true  });
    // const uoFiles = await readDir(GAME_FOLDER, { dir: BaseDirectory.Resource, recursive: true  });
    const hashesInfo = await getFileHashes();
    // const uoHashes = await getUoFilesHashes();
    console.log("test: ", allLocalGameFiles);

    const filesNeedsUpdate = await checkFilesInFolderThatNeedUpdate(allLocalGameFiles, hashesInfo);
    console.log('filesNeedsUpdate123: ', filesNeedsUpdate);
    // const uoFilesNeedsUpdate = await checkFilesInFolderThatNeedUpdate(gameFiles, uoHashes);


    // const filesNeedsUpdate: { [key: string]: String[] } = {
    //     "ClassicUO": cuoFilesNeedsUpdate,
    //     "uo_files": uoFilesNeedsUpdate
    // };
    console.log(filesNeedsUpdate)
    return filesNeedsUpdate;
};

export { getFilesNeedsUpdate };
export type { FileInfo };

