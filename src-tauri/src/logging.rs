use std::fs::OpenOptions;
use std::io::Write;
use chrono::Local;
use std::sync::atomic::{AtomicBool, Ordering};

static LOG_TO_FILE: AtomicBool = AtomicBool::new(false);

pub fn enable_file_logging(enable: bool) {
    LOG_TO_FILE.store(enable, Ordering::Relaxed);
}

fn log_to_file(message: &str) {
    if !LOG_TO_FILE.load(Ordering::Relaxed) {
        return;
    }

    let now = Local::now();
    let timestamp = now.format("%Y-%m-%d %H:%M:%S").to_string();
    let log_message = format!("[{}] {}\n", timestamp, message);
    
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("application.log")
    {
        if let Err(e) = file.write_all(log_message.as_bytes()) {
            eprintln!("Failed to write to log file: {}", e);
        }
    } else {
        eprintln!("Failed to open log file");
    }
}

// Logowanie w trybie dev
#[cfg(debug_assertions)]
pub fn log_debug(message: &str) {
    println!("[DEBUG] {}", message);
    log_to_file(&format!("[DEBUG] {}", message));
}


// Logowanie niezależne od trybu
pub fn log(message: &str) {
    println!("{}", message);
    log_to_file(&format!("{}", message));
}

pub fn log_to_file_only(message: &str) {
    log_to_file(&format!("{}", message));
}
