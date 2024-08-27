use std::path::{Path, PathBuf};
use std::io::{self, copy, Cursor};
use std::fs::{self, File, Permissions};

use reqwest::header::{HeaderMap, HeaderValue};
use reqwest::{Error, Response};
use std::os::unix::fs::PermissionsExt; // Potrzebne na Unix/Linux

pub async fn download_file(file_name: &str, path: &String, game_dir: &PathBuf, platform: &String) -> Result<(), String> {

    let url = build_url(file_name.to_string());

    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();
    headers.insert("Platform", HeaderValue::from_str(platform.as_str()).unwrap());

    // Wysyłamy zapytanie GET na podany URL
    let response = match client.get(url).headers(headers).send().await {
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
    std::io::copy(&mut content2, &mut dest);

    // if let Err(err) = copy(&mut content.as_ref(), &mut dest) {
    //     return Err(format!("Failed to write file: {}", err));
    // }

    let permissions = 0o755; // Uprawnienia do odczytu i wykonywania dla wszystkich
     
    // Zmieniamy uprawnienia pliku
    if let Err(err) = dest.set_permissions(Permissions::from_mode(permissions)) {
        return Err(format!("Failed to set permissions: {}", err));
    }

    Ok(())
}

fn build_url(file_name: String) -> String {
    "http://localhost:8008/uo_files/get_file/?file_name=".to_owned()+&file_name
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