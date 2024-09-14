import { BaseDirectory, createDir, exists } from "@tauri-apps/api/fs";
import { GAME_FOLDER } from "./consts";
import { getHttpClient } from "./httpClient";
import { invoke } from "@tauri-apps/api";
import { emit } from "@tauri-apps/api/event";

type HashInfo = {
    [key: string]: {
        base: boolean;
        hash: string;
        path: string;
        file_name: string;
    };
};

type FileInfo = {
    path: string;
};

class GameFileChecker {
    updateProgress: (progress: number) => void;
    updateStatus: (status: string) => void;
    status: boolean = false;
    updateDownloadInfo: (info: string) => void;

    constructor(updateProgress: (progress: number) => void, updateStatus: (status: string) => void, updateDownloadInfo: (info: string) => void) {
        this.updateProgress = updateProgress;
        this.updateStatus = updateStatus;
        this.updateDownloadInfo = updateDownloadInfo;
    }

    private async getFilesForUpdate() {
        this.updateStatus("Sprawdzanie plików");
        this.updateProgress(0);

        await this.createGameDirIfNotExists();
        return await this.getGameFilesToDownload();
    }

    private async downloadFiles(filesToUpdate: FileInfo[]) {
        console.log("filesToUpdate", filesToUpdate);
        this.updateStatus("Wymagana aktualizacja plików. Pobieranie...");
        this.updateProgress(0);
        let progress = 0;
        const total_files = filesToUpdate.length
        let old_value = 0;
        for (const file of filesToUpdate) {
            await invoke("download_file", { fileInfo: file });
            progress += 1;
            const percentage = Math.trunc((progress / total_files) * 100);
            if (percentage !== old_value) {
                old_value = percentage;
                this.updateProgress(percentage);
                this.updateStatus(percentage.toString() + "%");
                this.updateDownloadInfo(progress + " z " + total_files);
            }
        }
        this.updateStatus("Gotowe");
        this.updateDownloadInfo("");

        await emit('download_progress', '');


    }

    private async getGameFilesToDownload() {
        const currentGameFiles = await this.getCurrentGameFiles();
        const hashesInfo = await this.getFileHashes();
        console.log(hashesInfo);
        // console.log(hashesInfo);

        let filesNeedsUpdate: FileInfo[] = [];

        const checkFile = async (fileName: string) => {
            const hashInfo = hashesInfo[fileName];
            if (currentGameFiles.includes(fileName)) {
                if (hashInfo.base) {
                    const diskFileHash = await invoke<string>('calculate_sha256', { filePath:  fileName});
                    const remoteHash = hashesInfo[fileName].hash;
                    if (diskFileHash !== remoteHash) {
                        filesNeedsUpdate.push({ path: fileName});
                    };
                }
            } else {
                filesNeedsUpdate.push({ path: fileName });
            }
        }

        let progress = 0;
        const total_files = Object.keys(hashesInfo).length;
        let old_value = 0;
        for (const fileName in hashesInfo) {
            await checkFile(fileName);
            progress += 1;
            const percentage = Math.trunc((progress / total_files) * 100);
            if (percentage !== old_value) {
                old_value = percentage;
                this.updateProgress(percentage);
            }
        }
        return filesNeedsUpdate;
    }


    private async getFileHashes(): Promise<HashInfo> {
        const HTTP = await getHttpClient();
        const response = await HTTP.get('uo_files/hashes/');
        return response.data;
    }

    private async getCurrentGameFiles(): Promise<String[]> {
        return await invoke("get_files_in_game_folder");
        // const gameFiles = await readDir(GAME_FOLDER, { dir: BaseDirectory.Resource, recursive: true });
        // let mergedList: StringDictionary = {};
        // console.log("gameFiles", gameFiles);
        // const recursiveMerge = (entries: FileEntry[]) => {
        //     for (const entry of entries) {
        //         if (entry.children) {
        //             recursiveMerge(entry.children);
        //         } else {
        //             if (entry.name) {
        //                 mergedList[entry.name] = entry.path;
        //             }
        //         }
        //     }
        // }
        // recursiveMerge(gameFiles);
        // return mergedList;

    }

    private async createGameDirIfNotExists() {
        const game_dir_exists = await exists(GAME_FOLDER, { dir: BaseDirectory.Resource });
        if (game_dir_exists === false) {
            await createDir(GAME_FOLDER, { dir: BaseDirectory.Resource });
        }
    };

    public async start() {
        const filesToDownload = await this.getFilesForUpdate();
        // console.log(filesToDownload);
        if (filesToDownload.length === 0) {
            this.status = true;
        }
        else {
            await this.downloadFiles(filesToDownload);
        }
    }
}

export default GameFileChecker;