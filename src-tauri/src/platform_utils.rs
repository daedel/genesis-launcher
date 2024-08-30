
use std::env;

pub fn get_platform() -> &'static str {
    let os_type = env::consts::OS;
    match os_type {
        "windows" => {
            return "win";
        },
        "macos" => {
            return "osx";
        },
        "linux" => {
            return "linux";
        },
        _ => return "unknown"
    }

}