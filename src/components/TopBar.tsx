import { useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import SettingsModal from './settingsModal';

function TopBar() {
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    const handleMinimize = () => {
        appWindow.minimize();
    };

    const handleSettings = () => {
        // TODO: Implement settings action
        setModalIsOpen(true);
    };

    const handleExit = () => {
        appWindow.close();
    };


    return (
        <div className="flex justify-end items-end h-[45px] px-4 z-10 mr-5 border-0">
            <button
                onClick={handleSettings}
                className="ml-2 bg-settings_icon bg-cover h-[30px] w-[30px] hover:bg-settings_icon_hv" />
            <button
                onClick={handleMinimize}
                className="ml-2 bg-minimalize_icon bg-cover h-[30px] w-[30px] hover:bg-minimalize_icon_hv" />

            <button
                onClick={handleExit}
                className="ml-2 bg-close_icon bg-cover h-[30px] w-[30px] hover:bg-close_icon_hv" />
            <SettingsModal isOpen={modalIsOpen} setModalOpen={setModalIsOpen} />
        </div>
    );
};

export default TopBar;