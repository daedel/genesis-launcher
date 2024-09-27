import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';


const readGameSettings = async (key_name: string) => {
    try {
        const app_settings = await readTextFile("app-settings.json", { dir: BaseDirectory.AppData });
        if (app_settings) {
            const settings = JSON.parse(app_settings);
            return settings[key_name];
        }
        return null;
    }
    catch (error) {
        console.error('Error reading settings:', error);
        return null;
    }
 
}
export default readGameSettings;