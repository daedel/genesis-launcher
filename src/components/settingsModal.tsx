import { useState, useEffect, ChangeEvent } from 'react';
import Modal from 'react-modal';
import { readTextFile, writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs';
import { GAME_FOLDER } from '../utils/consts';


// Typy dla ustawień aplikacji
interface AppSettings {
    test_server: boolean;
    razor: boolean;
}

// Domyślne ustawienia
const defaultSettings: AppSettings = {
    test_server: false,
    razor: true,
};

interface SettingsModalProps {
    isOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
}

function SettingsModal({ isOpen, setModalOpen }: SettingsModalProps) {
    // const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    const settingsFilePath = 'app-settings.json';

    const loadSettings = async () => {
        try {
            const data = await readTextFile(settingsFilePath, { dir: BaseDirectory.AppData });
            setSettings(JSON.parse(data) as AppSettings);
        } catch (error) {

            if (!await exists(GAME_FOLDER, { dir: BaseDirectory.AppData })) {
                await createDir(GAME_FOLDER, { dir: BaseDirectory.AppData, recursive: true });
            }
            await writeTextFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2), { dir: BaseDirectory.AppData });
            setSettings(defaultSettings);
            console.error('Nie udało się załadować ustawień, używanie domyślnych.', error);
        }
    };

    // Funkcja do zapisania ustawień do pliku JSON
    const saveSettings = async () => {
        try {
            await writeTextFile(settingsFilePath, JSON.stringify(settings, null, 2), { dir: BaseDirectory.AppData });
        } catch (error) {
            console.error('Błąd podczas zapisywania ustawień:', error);
        }
    };

    useEffect(() => {
        loadSettings(); // Załaduj ustawienia przy pierwszym renderze
    }, []);

    const closeModal = () => {
        setModalOpen(false);
        closeModal();
    };

    const handleSaveSettings = () => {
        saveSettings();
        closeModal();
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        console.log('checked', checked);
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div>
            <Modal
                ariaHideApp={false}
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="Settings Modal"
                className="uppercase shadow-lg max-w-lg mx-auto my-10 text-[#BDA68C]"
                overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
            >
                <div className="relative bg-[#191b28] w-[350px] h-[263px]">
                    <div className='absolute bg-settings_bg opacity-20 w-full h-full bg-no-repeat bg-top z-0 pointer-events-none'></div>
                    <div className="opacity-100 w-full h-full border-0 bg-contain bg-no-repeat bg-settings_frame z-10">
                        <form>
                            <div className="flex flex-col items-center mb-4">
                                <div className="my-10 text-xl ">Ustawienia</div>
                                <div>
                                    <div className='flex flex-row '>
                                        <label className="block w-[140px] mb-1 text-sm italic">
                                            Testowy serwer:
                                        </label>
                                        <input
                                            type="checkbox"
                                            name="test_server"
                                            checked={settings.test_server}
                                            onChange={handleChange}
                                            className="h-4 w-4 border-gray-300 rounded ml-4 items-center justify-center "
                                        />
                                    </div>

                                    <div className='flex flex-row'>
                                        <label className="block w-[140px] mb-1 text-sm italic">
                                            Razor Enhanced:
                                        </label>
                                        <input
                                            type="checkbox"
                                            name="razor"
                                            checked={settings.razor}
                                            onChange={handleChange}
                                            className="h-4 w-4 border-gray-300 rounded ml-4 items-center justify-center "
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="flex items-center justify-center space-x-4 mt-10">
                                <button
                                    type="button"
                                    onClick={handleSaveSettings}
                                    className="px-8 py-2 bg-transparent border-[1px] rounded-sm border-[#BDA68C] text-[#BDA68C]  hover:bg-[#BDA68C] hover:text-[#544232]"
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-8 py-2 bg-transparent border-[1px] rounded-sm border-[#BDA68C] text-[#BDA68C]  hover:bg-[#BDA68C] hover:text-[#544232]"
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* </div> */}
                </div>

            </Modal>
        </div>
    );
};

export default SettingsModal;