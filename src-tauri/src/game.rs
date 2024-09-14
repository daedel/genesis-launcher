
use std::env;
use std::process::{Command, Stdio};
use std::io::{self, BufReader, BufRead};

use tauri::Manager;
use std::path::PathBuf;
use crate::http_client::ServerInfo;
use crate::{events, http_client, tray};
use crate::logging::{enable_file_logging, log, log_debug, log_to_file_only};


pub async fn add_os_secret_variable() -> Result<(), String> {
    env::set_var("TESTOWA", "1");
    println!("ustawiłem TESTOWA");

    Ok(())
}

pub async fn remove_os_secret_variable() -> Result<(), String> {
    env::remove_var("TESTOWA");
    Ok(())
}

fn normalize_path(path: PathBuf) -> PathBuf {
    let path_str = path.to_string_lossy(); // Zamienia PathBuf na String
    if path_str.starts_with(r"\\?\") {
        PathBuf::from(&path_str[4..]) // Usuwa \\?\ z początku
    } else {
        path
    }
}

pub async fn run_client(game_dir: std::path::PathBuf, app_handle: tauri::AppHandle, test_server: bool) -> Result<(), String> {
    log_debug("Stating setting up things for running CUO client...");
    let mut server_info = http_client::get_server_info().await.unwrap();

    #[cfg(debug_assertions)] {
        log_debug("Running in debug mode, using test server...");
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
    
    let uo_path = game_dir.join("..");
    let mut client_path = game_dir.clone();
    let os_type = env::consts::OS;

    let mut args: Vec<String> = vec!["-uopath".to_string(), uo_path.to_str().unwrap().to_string(), "-ip".to_string(), server_ip.as_str().to_string(), "-port".to_string(), server_port.as_str().to_string()];

    match os_type {
        "windows" => {
            let razor_path = client_path.join("Data").join("Plugins").join("RazorEnhanced").join("RazorEnhanced.exe");
            let normalized_razor_path = normalize_path(razor_path);

            args.push("-plugins".to_string());
            args.push(normalized_razor_path.to_str().unwrap().to_string());
            client_path.push("ClassicUO.exe");
        },  
        "macos" => {
            client_path.push("ClassicUO.bin.osx");
        },
        "linux" => {    
            client_path.push("ClassicUO");
        },
        _ => {
            log_debug("Unsupported OS type");
            return Err(format!("Unsupported OS type: {}", os_type));
        }
    }

    log_debug(&format!("Starting client from path: {}", client_path.to_string_lossy()));
    log_debug(&format!("Args for client: {:?}", args));
    log_debug(&format!("Current directory: {}", game_dir.to_string_lossy()));
    
    enable_file_logging(true);

    let mut child = match Command::new(client_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .current_dir(game_dir)
        .spawn() {
            Ok(child) => child,
            Err(err) => {
                log(&format!("Failed to start client: {}", err));
                return Err(format!("Failed to start client: {}", err))
            }
        };

    log_debug("Client started successfully");

    let main_window = app_handle.get_window("main").unwrap();
    events::send_update_status_event("Gra uruchomiona", main_window.clone()).await.unwrap();
    events::send_client_state_event(true, main_window.clone()).await.unwrap();
    
    tray::hide_window(app_handle).await.unwrap();

    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            log_debug(&format!("{}", line.expect("error reading line")));
        }
    }
    
    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            log_to_file_only(&format!("stderr: {}", line.unwrap()));
        }
    }

    let status = child.wait();
    enable_file_logging(false);
    log_debug(&format!("Client exited with status: {}", status.unwrap()));

    main_window.emit("updateStatus", "Graj").unwrap();
    main_window.emit("clientState", false).unwrap();
    main_window.show().unwrap();

    log_debug("Client exited");

    Ok(())
}