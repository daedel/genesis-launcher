
use std::env;
use std::process::{Command, Stdio};
use std::io::{self, BufRead};
use std::io::BufReader;
use tauri::Manager;

use crate::{events, tray};


pub async fn add_os_secret_variable() -> Result<(), String> {
    env::set_var("TESTOWA", "1");
    println!("ustawiłem TESTOWA");

    Ok(())
}

pub async fn remove_os_secret_variable() -> Result<(), String> {
    env::remove_var("TESTOWA");
    Ok(())
}

pub async fn run_client(game_dir: std::path::PathBuf, app_handle: tauri::AppHandle) -> Result<(), String> {
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

    let args = ["-uopath", "../"];

    let mut child = Command::new(client_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to execute command");

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

    main_window.emit("updateStatus", "").unwrap();
    main_window.emit("clientState", false).unwrap();
    main_window.show().unwrap();


    println!("koniec procesu klienta");

    Ok(())
}