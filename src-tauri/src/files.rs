use std::io::Cursor;
use std::fs::{self, Permissions};
use std::path::PathBuf;
use std::os::unix::fs::PermissionsExt; // Potrzebne na Unix/Linux
use crate::http_client;

pub async fn download_file(file_name: &str, path: &String, game_dir: &PathBuf) -> Result<(), String> {
    let client = http_client::get_http_client();
    let url: String = http_client::build_url(file_name.to_string());

    // Wysyłamy zapytanie GET na podany URL
    let response = match client.get(url).headers(http_client::get_common_headers()).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to send request: {}", err)),
    };

    // Sprawdzamy status odpowiedzi
    if !response.status().is_success() {
        return Err(format!("HTTP error: {}", response.status()));
    }

    let file_path = build_file_path(game_dir.clone(), path.to_string());
    print!("{}", file_path.to_str().unwrap());
    // Tworzymy katalogi jeśli nie istnieją
    if let Some(parent_dir) = file_path.parent() {
        if !parent_dir.exists() {
            if let Err(err) = fs::create_dir_all(parent_dir) {
                return Err(format!("Failed to create directories: {}", err));
            }
        }
    }
     // Otwieramy plik do zapisu, obsługując błędy
    let mut dest = match fs::File::create(&file_path) {
        Ok(file) => file,
        Err(err) => {
            return Err(format!("Failed to create file: {}", err));
        }
    };

    // Zapisujemy zawartość odpowiedzi do pliku
    let content = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => return Err(format!("Failed to read response body: {}", err)),
    };

    let mut content2 =  Cursor::new(content);
    println!("zapisuje na dysk plik {}", &file_name);

    if let Err(err) = std::io::copy(&mut content2, &mut dest) {

        return Err(format!("Failed to write file: {}", err));
    }

    let permissions = 0o755; // Uprawnienia do odczytu i wykonywania dla wszystkich
     
    // Zmieniamy uprawnienia pliku
    if let Err(err) = dest.set_permissions(Permissions::from_mode(permissions)) {
        return Err(format!("Failed to set permissions: {}", err));
    }

    Ok(())
}


fn build_file_path(mut game_dir: PathBuf , file_name: String) -> PathBuf {
    game_dir.push(file_name);
    game_dir
}

pub fn get_game_folder_path_buf(app_handle: tauri::AppHandle) -> PathBuf {
    let mut resource_dir = app_handle.path_resolver().resource_dir().expect("no resource dir");
    resource_dir.push("game/");
    return resource_dir;
    
}