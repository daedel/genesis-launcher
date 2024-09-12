
use std::env;
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::Manager;
use std::fs;
use std::path::{Path, PathBuf};


use crate::http_client::ServerInfo;
use crate::{events, http_client, tray};


pub async fn add_os_secret_variable() -> Result<(), String> {
    env::set_var("TESTOWA", "1");
    println!("ustawiłem TESTOWA");

    Ok(())
}

pub async fn remove_os_secret_variable() -> Result<(), String> {
    env::remove_var("TESTOWA");
    Ok(())
}

pub async fn run_client(game_dir: std::path::PathBuf, app_handle: tauri::AppHandle, test_server: bool) -> Result<(), String> {
    println!("startuje klienta");


    let mut client_path = game_dir.clone();
    let os_type = env::consts::OS;

    match os_type {
        "windows" => {
            client_path.push("ClassicUO.exe");
        },
        "macos" => {
            client_path.push("ClassicUO.bin.osx");
        },
        "linux" => {
            client_path.push("ClassicUO");
        },
        _ => {
            println!("Nieznany system operacyjny.");
        }
    }
    println!("client_path: {}", client_path.to_string_lossy());
    let mut server_info = http_client::get_server_info().await.unwrap();

    #[cfg(debug_assertions)] {
        server_info = ServerInfo {
            server_ip: "localhost".to_string(),
            server_port: "5001".to_string(),
            test_server_ip: "localhost".to_string(),
            test_server_port: "5002".to_string(),
            allow_login: true,
        }
    }

    let server_ip = if test_server { server_info.test_server_ip } else { server_info.server_ip };
    let server_port = if test_server { server_info.test_server_port } else { server_info.server_port };
    
    let uo_relative_path = game_dir.join("..");
    let absolute_path: PathBuf = match fs::canonicalize(&uo_relative_path) {
        Ok(path) => path,
        Err(e) => {
            return Err(format!("Error getting absolute path: {}", e));
        }
    };
    let args: [&str; 6] = ["-uopath", absolute_path.to_str().unwrap(), "-ip", server_ip.as_str(), "-port", server_port.as_str()];

    print!("args: {:?}", args);
    let mut child = match Command::new(client_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn() {
            Ok(child) => child,
            Err(err) => {
                println!("failed to start client with error: {}", err);
                return Err(format!("Failed to start client: {}", err))
            }
        };


    let main_window = app_handle.get_window("main").unwrap();
    events::send_update_status_event("Gra uruchomiona", main_window.clone()).await.unwrap();
    events::send_client_state_event(true, main_window.clone()).await.unwrap();
    tray::hide_window(app_handle).await.unwrap();
   
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            println!("output: {}", line.expect("error reading line"));
        }
    }
    
    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            eprintln!("error: {}", line.expect("error reading line"));
        }
    }

    let status = child.wait().expect("blad procesu");
    println!("Process exited with status: {}", status);

    main_window.emit("updateStatus", "Graj").unwrap();
    main_window.emit("clientState", false).unwrap();
    main_window.show().unwrap();


    println!("koniec procesu klienta");

    Ok(())
}