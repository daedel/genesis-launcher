import { useState, useEffect, ChangeEvent } from 'react';
import Modal from 'react-modal';
import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';


// Typy dla ustawień aplikacji
interface AppSettings {
    test_server: boolean;
}

// Domyślne ustawienia
const defaultSettings: AppSettings = {
    test_server: false,
};

function SettingsModal(){
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [settings, setSettings] = useState<AppSettings>(defaultSettings);

    const settingsFilePath = 'app-settings.json';

    const loadSettings = async () => {
        try {
            const data = await readTextFile(settingsFilePath, { dir: BaseDirectory.AppLocalData });
            setSettings(JSON.parse(data) as AppSettings);
        } catch (error) {
            
            await writeTextFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2), { dir: BaseDirectory.AppLocalData });
            setSettings(defaultSettings);
            console.error('Nie udało się załadować ustawień, używanie domyślnych.', error);
        }
    };

    // Funkcja do zapisania ustawień do pliku JSON
    const saveSettings = async () => {
        try {
            await writeTextFile(settingsFilePath, JSON.stringify(settings, null, 2), { dir: BaseDirectory.AppLocalData });
        } catch (error) {
            console.error('Błąd podczas zapisywania ustawień:', error);
        }
    };

    useEffect(() => {
        loadSettings(); // Załaduj ustawienia przy pierwszym renderze
    }, []);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
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
            <button
                onClick={openModal}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                <i className="settings-icon">⚙️</i> Ustawienia
            </button>
            <Modal
                ariaHideApp={false}
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Settings Modal"
                className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto my-20"
                overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-xl font-semibold mb-4">Ustawienia Aplikacji</h2>
                <form>
                    <div className="mb-4">
                    </div>
                    <div className="flex items-center mb-4">
                        <label className="block text-gray-700 font-medium mb-1">
                            Testowy serwer:
                        </label>
                        <input
                            type="checkbox"
                            name="test_server"
                            checked={settings.test_server}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded ml-4"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Zapisz
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SettingsModal;