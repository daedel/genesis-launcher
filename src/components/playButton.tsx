import buttonImage from "../assets/button-image_1.webp";
import { invoke } from '@tauri-apps/api/tauri'
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import GameFileChecker from "../utils/checkFiles";
// write state expresion from react for file status


interface ChildProps {
    updateProgress: (newProgress: number) => void;
    updateStatus: (newStatus: string) => void;
}


function PlayButton({ updateProgress, updateStatus }: ChildProps) {
    const [clientState, setState] = useState(false);
    const [fileCheckerStatus, setFileCheckerStatus] = useState(false);
    
    useEffect(() => {
        const unlisten1 = listen<string>('updateStatus', (event) => {
            if (event.payload) {
                updateStatus(event.payload);
            }
            console.log('Received event:', event.payload);
            updateStatus(event.payload);
        });

        const unlisten2 = listen<boolean>('clientState', (event) => {
            console.log('Received event:', event);
            setState(event.payload);
        });

        return () => {
            unlisten1.then(f => f());
            unlisten2.then(f => f());
        };
    }
        , []);


    const start_game = async () => {
        
        console.log("clientState: ", clientState);
        if(clientState === true){
            updateStatus("Klient już uruchomiony!");
            setTimeout(() => {
                updateStatus("Gra uruchomiona");
              }, 3000); // 5000 milisekund = 5 sekund
            return;
        } else if (fileCheckerStatus === true) {
            return;
        }
        setFileCheckerStatus(true)
        const fileChecker = new GameFileChecker(updateProgress, updateStatus);
        await fileChecker.start();
        console.log("status: ", fileChecker.status);
        if (fileChecker.status === true) {
            console.log("Pobieranie plików zakończone");
            updateStatus("Włączanie gry");
            await invoke("run_game");
        }
        setFileCheckerStatus(false)

    }

    return (
        <div className="block mt-5 mb">
            <div className="flex items-center justify-center">
                <div className="w-72">
                <button type="submit" onClick={start_game} className="relative z-10 hover:scale-105 transition duration-500">
                    <img src={buttonImage}></img>
                    <div className="absolute w-[74%] h-[55%] -z-10 bg-play_bg m-auto top-0 bottom-0 left-0 right-0"></div>
                    <div className="flex absolute justify-center items-center z-10 top-0 bottom-0 left-0 right-0 text-white font-medium font-['Barlow']">Graj</div>
                </button>
                </div>
            </div>
        </div>
    )
}
export default PlayButton;