
import buttonImage from "../assets/button-image_1.webp";
import { FileInfo, getFilesNeedsUpdate } from "../utils/settings";
import { invoke } from '@tauri-apps/api/tauri'
import { getPlatform } from "../utils/httpClient";

// write state expresion from react for file status



function PlayButton() {
    let allowRunGame = false;
    const start_game = async () => {
        await checkFiles();
        console.log('allowRunGame: ', allowRunGame);
        if (allowRunGame === true) {
            console.log("Pobieranie plików zakończone");
            await invoke("run_game");

        }
    }
    
    const processDownloadFiles = async (filesToUpdate: FileInfo[]) => {
        console.log("siemka")
        const platform = await getPlatform();
        const result = await invoke("download_files", {files: filesToUpdate, platform: platform});
        console.log(result);
        // const result2 = await invoke("download_files", {fileNames: filesToUpdate["uo_files"], folderName: "uo_files", platform: platform});
        // console.log(result2);


    };

    const checkFiles = async () => {
        // let currentStatus = "";
        // let wholeProgress = 0;
        const filesToUpdate = await getFilesNeedsUpdate();
        console.log(filesToUpdate);
        if (filesToUpdate.length === 0) {
            allowRunGame = true;
            console.log("stasrtuje");
        }
        else {
            console.log("pobieram pliki");
            await processDownloadFiles(filesToUpdate);
        }
    }
    
    return (
        <div className="w-72">
            <button type="submit" onClick={start_game} className="relative z-10 hover:scale-105 transition duration-500">
                <img src={buttonImage}></img>
                <div className="absolute w-[74%] h-[55%] -z-10 bg-play_bg m-auto top-0 bottom-0 left-0 right-0"></div>
                <div className="flex absolute justify-center items-center z-10 top-0 bottom-0 left-0 right-0 text-white font-medium font-['Barlow']">Graj</div>
            </button>
        </div>
    )
}
export default PlayButton;