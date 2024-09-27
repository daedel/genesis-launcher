use std::io::{self, Write, Cursor};
use zip::read::ZipArchive;

use std::fs::{self, File};
use std::path::{Path, PathBuf};
use crate::http_client;
use std::time::{Instant, Duration};
use futures::StreamExt;
use tauri::Manager;
use tokio_util::io::StreamReader;
use std::error::Error;
// use std::os::unix::fs::PermissionsExt; // Potrzebne na Unix/Linux

pub async fn download_files(files: Vec<String>, app_handle: tauri::AppHandle) -> Result<(), String> {
    
    let client = http_client::get_http_client();
    let url: String = http_client::build_url();
    println!("{}", url);
    let mut game_dir: std::path::PathBuf = get_game_folder_path_buf(app_handle.clone());

    // Wysyłamy zapytanie GET na podany URL
    let response = match client.post(url.clone()).headers(http_client::get_common_headers()).json(&serde_json::json!(files)).send().await {
        Ok(resp) => resp,
        Err(err) => return Err(format!("Failed to send request to url {}: error: {}", url, err)),
    };

    // Sprawdzamy status odpowiedzi
    if !response.status().is_success() {
        return Err(format!("HTTP error: status: {}, detail: {}", response.status(), response.url()));
    }

    // let file_path = build_file_path(game_dir.clone(), path.to_string());
    // print!("{}", file_path.to_str().unwrap());
    // // Tworzymy katalogi jeśli nie istnieją
    // if let Some(parent_dir) = file_path.parent() {
    //     if !parent_dir.exists() {
    //         if let Err(err) = fs::create_dir_all(parent_dir) {
    //             return Err(format!("Failed to create directories: {}", err));
    //         }
    //     }
    // }

    // let mut dest = match fs::File::create(&file_path) {
    //     Ok(file) => file,
    //     Err(err) => {
    //         return Err(format!("Failed to create file: {}", err));
    //     }
    // };
    let window = app_handle.get_window("main").unwrap();
       // Pobranie całkowitej wielkości zawartości (jeśli jest dostępna)
    let total_size = response.content_length().unwrap_or(0);
    println!("Rozmiar pliku: {} bajtów", total_size);

    let mut stream = response.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut buffer = Vec::new();


    let start_time = Instant::now(); // Zapisz czas rozpoczęcia pobierania

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?; // Obsługa błędów podczas pobierania
        buffer.extend_from_slice(&chunk);

        downloaded += chunk.len() as u64; // Zaktualizuj liczbę pobranych bajtów
        
        // Oblicz procent pobranych danych
        let percentage = (downloaded as f64 / total_size as f64) * 100.0;
        let elapsed_time = start_time.elapsed().as_secs_f64();
        let speed = downloaded as f64 / elapsed_time / 1024.0; // prędkość w KB/s

        // Wyświetl informacje o postępie
        println!(
            "Pobrano: {} bajtów ({}%), Prędkość: {:.2} KB/s",
            downloaded, percentage, speed
        );
    }

    // Kiedy pobieranie zakończone, przetwarzamy plik ZIP
    let reader = Cursor::new(buffer);
    let mut archive = ZipArchive::new(reader).map_err(|e| e.to_string())?;

    // Rozpakowanie każdego pliku z archiwum
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = match file.enclosed_name() {
            Some(path) => Path::new(path), // Pobieramy oryginalną ścieżkę pliku
            None => continue,
        };
        // println!(
        //     "Pobrano: {} ",
        //     outpath(),
        // );
        // game_dir.push(outpath);
        let file_path = build_file_path(game_dir.clone(), outpath);
        print!("{}", file_path.to_str().unwrap_or_default());
        // Tworzymy katalogi jeśli nie istnieją
        if let Some(parent_dir) = file_path.parent() {
            if !parent_dir.exists() {
                if let Err(err) = fs::create_dir_all(parent_dir) {
                    return Err(format!("Failed to create directories: {}", err));
                }
            }
        }
        // // Jeśli plik jest w folderze, to tworzymy odpowiednie foldery
        // if let Some(parent) = outpath.parent() {
        //     std::fs::create_dir_all(parent)?;
        // }
        // Zapisujemy plik do systemu plików
        let mut outfile = File::create(&file_path).map_err(|e| e.to_string())?;
        std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        let _ = set_file_permissions(outfile); 

    }
    // let total_elapsed = start_instant.elapsed();
    // if total_elapsed.as_secs_f64() > 0.0 && downloaded > 0 {
    //     let final_speed = (downloaded as f64 / total_elapsed.as_secs_f64()) / (1024.0 * 1024.0); // MB/s
    //     window.emit("download_progress", final_speed).map_err(|e| e.to_string())?;
    // }

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