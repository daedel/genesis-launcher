use std::io::Write;
use std::fs::{self, File};
use std::path::{Path, PathBuf};
use crate::http_client;
use std::time::{Instant, Duration};
use futures_util::StreamExt;
use tauri::Manager;

// use std::os::unix::fs::PermissionsExt; // Potrzebne na Unix/Linux

pub async fn download_file(path: &String, app_handle: tauri::AppHandle) -> Result<(), String> {
    
    let client = http_client::get_http_client();
    let url: String = http_client::build_url(path.to_string());
    let game_dir: std::path::PathBuf = get_game_folder_path_buf(app_handle.clone());

    // Wysyłamy zapytanie GET na podany URL
    let response = match client.get(url.clone()).headers(http_client::get_common_headers()).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to send request to url {}: error: {}", url, err)),
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

    let mut dest = match fs::File::create(&file_path) {
        Ok(file) => file,
        Err(err) => {
            return Err(format!("Failed to create file: {}", err));
        }
    };
    let window = app_handle.get_window("main").unwrap();
    let mut stream = response.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut last_instant = Instant::now();
    let start_instant = Instant::now(); // Zapisz czas rozpoczęcia pobierania

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?; // Obsługa błędów podczas pobierania
    
        dest.write_all(&chunk).map_err(|e| e.to_string())?; // Zapisz dane do pliku
        downloaded += chunk.len() as u64; // Zaktualizuj liczbę pobranych bajtów
        
        // Oblicz prędkość pobierania co sekundę

        let elapsed = last_instant.elapsed();

        if elapsed >= Duration::from_secs(1) {
            let speed = (downloaded as f64 / elapsed.as_secs_f64()) / (1024.0 * 1024.0); // Prędkość w MB/s
            last_instant = Instant::now();
            
            // Wyślij prędkość do frontendu
            window.emit("download_progress", speed).map_err(|e| e.to_string())?;
            println!("{}", speed);
            downloaded = 0; // Zresetuj licznik pobranych bajtów dla kolejnej sekundy
        }
    }

    let total_elapsed = start_instant.elapsed();
    if total_elapsed.as_secs_f64() > 0.0 && downloaded > 0 {
        let final_speed = (downloaded as f64 / total_elapsed.as_secs_f64()) / (1024.0 * 1024.0); // MB/s
        window.emit("download_progress", final_speed).map_err(|e| e.to_string())?;
    }

    set_file_permissions(dest); 
    Ok(())
}

fn set_file_permissions(file: File) -> std::io::Result<()> {
    let mut perms = file.metadata()?.permissions();

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt; // Potrzebne dla macOS i Linux
        perms.set_mode(0o755); // Ustawia rw-r--r--
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::prelude::*;
        // Na Windows możemy ustawić uprawnienia za pomocą atrybutów pliku
        perms.set_readonly(false);
    }

    file.set_permissions(perms)?;
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

pub fn get_all_files_in_game_folder(app_handle: tauri::AppHandle) -> Vec<String> {
    let game_dir = get_game_folder_path_buf(app_handle.clone());
    get_files_recursive(&game_dir, &game_dir)
}

fn get_files_recursive(dir: &Path, base_dir: &Path) -> Vec<String> {
    let mut files = Vec::new();
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Ok(relative_path) = path.strip_prefix(base_dir) {
                    let normalized_path = normalize_path(relative_path);
                    files.push(normalized_path);
                }
            } else if path.is_dir() {
                files.extend(get_files_recursive(&path, base_dir));
            }
        }
    }
    files
}

fn normalize_path(path: &Path) -> String {
    path.components()
        .map(|comp| comp.as_os_str().to_string_lossy().into_owned())
        .collect::<Vec<String>>()
        .join("/")
}