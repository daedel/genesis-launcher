use std::io::Cursor;
use zip::read::ZipArchive;

use std::fs::{self, File};
use std::path::{Path, PathBuf};
use crate::http_client;
use crate::logging::log_debug;
use std::time::Instant;
use futures::StreamExt;
use tauri::Manager;

pub async fn download_files(files: Vec<String>, app_handle: tauri::AppHandle) -> Result<(), String> {
    
    let client = http_client::get_http_client();
    let url: String = http_client::build_url();
    println!("{}", url);
    let game_dir: std::path::PathBuf = get_game_folder_path_buf(app_handle.clone());

    // Wysyłamy zapytanie GET na podany URL
    let response = match client.post(url.clone()).headers(http_client::get_common_headers()).json(&serde_json::json!(files)).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to send request to url {}: error: {}", url, err)),
    };

    // Sprawdzamy status odpowiedzi
    if !response.status().is_success() {
        return Err(format!("HTTP error: status: {}, detail: {}", response.status(), response.url()));
    }

    let window = app_handle.get_window("main").unwrap();
       // Pobranie całkowitej wielkości zawartości (jeśli jest dostępna)
    let total_size = response.content_length().unwrap_or(0);
    let total_size_mb = format!("{:.2} MB", total_size as f64 / 1_048_576.0);
    println!("{}", total_size_mb);
    window.emit("download_size", total_size_mb).map_err(|e| e.to_string())?;


    let mut stream = response.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut buffer = Vec::new();


    let start_time = Instant::now(); // Zapisz czas rozpoczęcia pobierania
    let mut current_percentage = 0 as i32;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?; // Obsługa błędów podczas pobierania
        buffer.extend_from_slice(&chunk);

        downloaded += chunk.len() as u64; // Zaktualizuj liczbę pobranych bajtów
        
        // Oblicz procent pobranych danych

        let percentage = ((downloaded as f64 / total_size as f64) * 100.0) as i32;
        let elapsed_time = start_time.elapsed().as_secs_f64();

        let speed = downloaded as f64 / elapsed_time / 1_048_576.0; // speed in MB/s
        
        // Calculate estimated time left
        let remaining_bytes = total_size - downloaded;
        let time_left_secs = remaining_bytes as f64 / (speed * 1_048_576.0);
        let time_left = format!("{:.0} seconds", time_left_secs);

        if percentage > current_percentage {
            window.emit("downloadProgress", percentage).map_err(|e| e.to_string())?;

            let formatted_speed = format!("{:.2} MB/s", speed);
            window.emit("download_speed", formatted_speed).map_err(|e| e.to_string())?;
            current_percentage = percentage;

            // Display progress information
            log_debug(format!(
                "Downloaded: {} bytes ({:.2}%), Speed: {:.2} MB/s, Time left: {}",
                downloaded, percentage, speed, time_left
            ));
            window.emit("time_left", time_left).map_err(|e| e.to_string())?;

        }
        // can you add here variable that contains time left base on curernt speed?
        

        
    }
    window.emit("downloadProgress", 0).map_err(|e| e.to_string())?;
    window.emit("download_speed", "").map_err(|e| e.to_string())?;
    window.emit("updateStatus", "Kopiowanie plików").map_err(|e| e.to_string())?;

    // Kiedy pobieranie zakończone, przetwarzamy plik ZIP
    let reader = Cursor::new(buffer);
    let mut archive = ZipArchive::new(reader).map_err(|e| e.to_string())?;

    // Rozpakowanie każdego pliku z archiwum
    let arch_len = archive.len();
    for i in 0..arch_len {
        window.emit("downloadProgress", ((i+1) * 100) / arch_len).map_err(|e| e.to_string())?;

        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => Path::new(path), // Pobieramy oryginalną ścieżkę pliku
            None => continue,
        };
        

        let file_path = build_file_path(game_dir.clone(), outpath);
        log_debug(file_path.to_string_lossy().to_string());
        // Tworzymy katalogi jeśli nie istnieją
        if let Some(parent_dir) = file_path.parent() {
            if !parent_dir.exists() {
                if let Err(err) = fs::create_dir_all(parent_dir) {
                    return Err(format!("Failed to create directories: {}", err));
                }
            }
        }
        
        // Zapisujemy plik do systemu plików
        let mut outfile = File::create(&file_path).map_err(|e| e.to_string())?;
        std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        let _ = set_file_permissions(outfile); 

    }

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


fn build_file_path(mut game_dir: PathBuf , file_name: &Path) -> PathBuf {
    game_dir.push(file_name);
    game_dir
}

pub fn get_game_folder_path_buf(app_handle: tauri::AppHandle) -> PathBuf {
    let mut game_dir = app_handle.path_resolver().app_data_dir().expect("no resource dir");
    game_dir.push("Ultima Online - Genesis/");
    return game_dir;
    
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