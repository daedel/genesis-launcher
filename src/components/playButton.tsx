import buttonImage from "../assets/button-image_1.webp";
import { invoke } from '@tauri-apps/api/tauri'
import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import GameFileChecker from "../utils/checkFiles";
import readGameSettings from "../utils/settings";
import { BaseDirectory, exists, readDir } from "@tauri-apps/api/fs";
import { GAME_FOLDER } from "../utils/consts";
import { useLoading } from "../contexts/Loading";
import StatusFrame from "./statusFrame";

// write state expresion from react for file status

enum ButtonStatus {
    Install = "Instaluj",
    Play = "Graj",
    ClientRunning = "Klient już uruchomiony!",
    GameRunning = "Gra uruchomiona",
    GameStarting = "Włączanie gry",
    ServerConnectionError = "Bład połączenia z serverem. Spróbuj ponownie później",
    GameStartingError = "Bład podczas uruchamiania gry"
}

function PlayButton() {
    const [clientState, setState] = useState(false);
    const [fileCheckerStatus, setFileCheckerStatus] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [status, setStatus] = useState("");
    const [downloadInfo, setDownloadInfo] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const [downloadSpeed, setDownloadSpeed] = useState("");
    const [downloadSize, setDownloadSize] = useState("");
    const [timeLeft, setTimeLeft] = useState("");

    const { startLoading, stopLoading } = useLoading();

    // Funkcje do obsługi najechania i opuszczenia przycisku
    const handleMouseEnter = () => {
        setIsHovered(true);
        // Możesz tutaj np. symulować aktualizację danych o pobieraniu
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        const unlisten1 = listen<string>('updateStatus', (event) => {
            setStatus(event.payload);
        });

        const unlisten2 = listen<boolean>('clientState', (event) => {
            setState(event.payload);
        });

        const unlisten3 = listen<number>('downloadProgress', (event) => {
            setCompleted(event.payload);
        });

        const unlisten5 = listen<string>('download_speed', (event) => {
            setDownloadSpeed(event.payload);

        });

        const unlisten6 = listen<string>('download_size', (event) => {
            setDownloadSize(event.payload);

        });

        const unlisten7 = listen<string>('time_left', (event) => {
            setTimeLeft(event.payload);

        });

        const unlisten4 = listen<string>('console', (event) => {
            console.log(event.payload);
        });



        const initial_status = async () => {
            try {
                const status = await get_initial_button_status(); // Wywołanie funkcji asynchronicznej
                setStatus(status); // Ustawienie wyniku jako wartość stanu
            } catch (error) {
                console.error("Błąd podczas pobierania danych:", error);
            }
        };

        initial_status();
        return () => {
            unlisten1.then(f => f());
            unlisten2.then(f => f());
            unlisten3.then(f => f());
            unlisten4.then(f => f());
            unlisten5.then(f => f());
            unlisten6.then(f => f());
            unlisten7.then(f => f());



        };
    }
        , []);

    const get_initial_button_status = async () => {
        const game_dir_exists = await exists(GAME_FOLDER, { dir: BaseDirectory.AppData });
        if (game_dir_exists === false) {
            return ButtonStatus.Install
        };

        const gameFiles = await readDir(GAME_FOLDER, { dir: BaseDirectory.AppData});
        if(gameFiles.length === 0) {
            return ButtonStatus.Install
        }
        return ButtonStatus.Play;
    }

    const start_game = async () => {

        if (clientState === true) {
            setStatus("Klient już uruchomiony!");
            setTimeout(() => {
                setStatus("Gra uruchomiona");
            }, 3000); // 5000 milisekund = 5 sekund
            return;
        } else if (fileCheckerStatus === true) {
            return;
        }
        startLoading();
        setFileCheckerStatus(true)
        const fileChecker = new GameFileChecker(setCompleted, setStatus, setDownloadInfo);
        try {
            await fileChecker.start();
        } catch (error) {
            console.error('Error checking files:', error);
            setStatus("Bład połączenia z serverem. Spróbuj ponownie później");
            setFileCheckerStatus(false);
        }
        if (fileChecker.status === true) {
            setStatus("Włączanie gry");
            const test_server = await readGameSettings("test_server");
            const razor = await readGameSettings("razor");

            console.log('test_server', test_server);
            try {
                await invoke("run_game", { testServer: test_server, razor: razor });
            } catch (error) {
                console.error('Error running game:', error);
                setStatus("Błąd podczas uruchamiania gry");
                setFileCheckerStatus(false)
                stopLoading();
            }
        }
        setFileCheckerStatus(false);

    }

    const canShowStatusFrame = () => {
        return isHovered && downloadSpeed;
    }

    return (
        <div className="block mt-0 mb z-0 relative">
            <div className="flex items-center justify-center">
                <div className="w-[230px]">
                    <button type="submit" onClick={start_game} className="relative z-10 hover:scale-105 transition duration-500" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <img src={buttonImage}></img>
                        <div className="absolute w-[74%] h-[55%] -z-10 bg-play_bg m-auto top-0 bottom-0 left-0 right-0">
                            <div
                                className="absolute inset-0 bg-blue-500"
                                style={{ width: `${completed}%` }}
                            ></div>
                        </div>
                        <div className="flex absolute justify-center items-center top-0 bottom-0 left-0 right-0 text-white font-medium font-['Barlow']">{status} {downloadInfo && <br></br>}{downloadInfo}</div>
                        {/* {downloadInfo && <div className="flex absolute justify-center items-center top-0 bottom-0 left-0 right-0 text-white font-medium font-['Barlow']"><br></br>{downloadInfo}</div>} */}

                    </button>
                </div>
            </div>
            {canShowStatusFrame() && (
                <StatusFrame downloadSpeed={downloadSpeed} downloaded={downloadSize} timeLeft={timeLeft} />
            )
            }
        </div>
    )
}
export default PlayButton;
