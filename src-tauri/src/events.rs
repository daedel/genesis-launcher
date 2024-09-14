use serde::Serialize;

use crate::logging::log_debug;


pub async fn send_update_status_event(payload: &str, window: tauri::Window) -> Result<(), String> {
    send_event("updateStatus", payload, window)
}


pub async fn send_client_state_event(payload: bool, window: tauri::Window) -> Result<(), String> {
    send_event("clientState", payload, window)
}

fn send_event<S: Serialize + Clone>(event: &str, payload: S, window: tauri::Window) -> Result<(), String> {
    window.emit(event, payload).unwrap();
    log_debug("Sent event: {event} with payload: {payload}");
    Ok(())
}