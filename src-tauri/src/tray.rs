use tauri::Manager;


pub async fn hide_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    let main_window = app_handle.get_window("main").unwrap();
    main_window.hide().unwrap();
    Ok(())
}

pub async fn update_tray_item(id: &str, app_handle: tauri::AppHandle) -> Result<(), String> {

    let item_handle = app_handle.tray_handle().get_item(&id);
    item_handle.set_title("Show").unwrap();
    Ok(())
}