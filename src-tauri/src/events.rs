

pub async fn send_update_status_event(payload: &str, window: tauri::Window) -> Result<(), String> {
    window.emit("updateStatus", payload).unwrap();
    Ok(())
}


pub async fn send_client_state_event(payload: bool, window: tauri::Window) -> Result<(), String> {
    window.emit("clientState", payload).unwrap();
    Ok(())
}