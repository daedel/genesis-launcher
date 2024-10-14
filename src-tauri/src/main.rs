// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use files::get_game_folder_path_buf;
use logging::log_debug;
use sha2::digest::consts::False;
use tauri::{Manager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, PhysicalSize};
use std::fs::File;
use sha2::{Sha256, Digest};
use tauri;
use std::io::Read;
use serde::Deserialize;
use serde::Serialize;

mod game;
mod files;
mod events;
mod tray;
mod platform_utils;
mod http_client;
mod logging;

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct FileInfo {
    path: String,
}

#[tauri::command]
async fn run_game(app_handle: tauri::AppHandle, test_server: bool, razor: bool) -> Result<(), String> { // note String instead of Error
  log_debug("run_game".to_string());
  game::add_os_secret_variable().await?;
  
  let mut game_dir = get_game_folder_path_buf(app_handle.clone());
  game_dir.push("ClassicUO");

  game::run_client(game_dir, app_handle, test_server, razor).await?;

  Ok(())
}

#[tauri::command]
async fn download_files(files: Vec<String>, app_handle: tauri::AppHandle) { // note String instead of Error
  match files::download_files(files, app_handle.clone()).await {
      Ok(_) => println!("Downloaded files",),
      Err(e) => eprintln!("Error downloading files: {}", e),
  }
}

#[tauri::command]
async fn calculate_sha256(file_path: String, app_handle: tauri::AppHandle) -> Result<String, String> {
  let game_dir = files::get_game_folder_path_buf(app_handle.clone());
  let mut file = match File::open(game_dir.join(file_path)) {
        Ok(file) => file,
        Err(_) => return Err("Could not open file".to_string()),
    };

    let mut hasher = Sha256::new();
    let mut buffer = [0; 4096];
    
    loop {
        match file.read(&mut buffer) {
            Ok(0) => break, // End of file
            Ok(n) => hasher.update(&buffer[..n]),
            Err(_) => return Err("Error reading file".to_string()),
        }
    }

    Ok(format!("{:x}", hasher.finalize()))
}

#[tauri::command]
async fn get_files_in_game_folder(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let files = files::get_all_files_in_game_folder(app_handle.clone());
    Ok(files)
}


fn main() {
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let hide = CustomMenuItem::new("hide".to_string(), "Hide");
  let show = CustomMenuItem::new("show".to_string(), "Show");

  let tray_menu = SystemTrayMenu::new()
    .add_item(quit)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(hide)
    .add_item(show);


  let system_tray = SystemTray::new()
    .with_menu(tray_menu);
  tauri::Builder::default()
    .setup(|app| {
      let main_window = app.get_window("main").unwrap();
      let scale_factor = main_window.scale_factor().unwrap();
      println!("inner_size {:?}", main_window.inner_size());
      println!("scale_factor {:?}", main_window.scale_factor());
      main_window.set_size(PhysicalSize::new((715.0 * scale_factor) as u32, (505.0 * scale_factor) as u32)).unwrap();
      main_window.set_decorations(false);
      Ok(())
    })
  .system_tray(system_tray)
  .on_system_tray_event(|app, event| match event {
    SystemTrayEvent::MenuItemClick { id, .. } => {
      match id.as_str() {
        "quit" => {
          let window = app.get_window("main").unwrap();
          window.close().unwrap();
        },
        "hide" => {
          let main_window = app.get_window("main").unwrap();
          main_window.hide().unwrap();
        },
        "show" => {
          let main_window = app.get_window("main").unwrap();
          main_window.show().unwrap();
        }
        _ => {}
      }
    }
    _ => {}
  })
  .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
    println!("{}, {argv:?}, {cwd}", app.package_info().name);
    app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();
  }))
  .invoke_handler(tauri::generate_handler![download_files, run_game, calculate_sha256, get_files_in_game_folder])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}


  // Ok(())

  // if path.len() > 0 {
  //   resource_dir.push(&path);
  // }

  // resource_dir.push(&file_name);
  // fs::create_dir_all(resource_dir.parent().unwrap());
  // println!("resource_dir: {}", resource_dir.to_string_lossy());
  // let target = "http://localhost:8008/uo_files/get_file/".to_owned()+&file_name;
  // let response = reqwest::get(target).await.map_err(|err| err.to_string())?.bytes().await.map_err(|err| err.to_string())?;
  // let mut file = std::fs::File::create(resource_dir).map_err(|err| err.to_string())?;
  // let mut content =  Cursor::new(response);
  // println!("zapisuje na dysk plik {}", &file_name);
  // std::io::copy(&mut content, &mut file);
