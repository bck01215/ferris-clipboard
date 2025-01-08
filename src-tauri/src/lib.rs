use enigo::Mouse;



#[tauri::command]
fn get_coords() -> (i32, i32) {
    let  enigo: enigo::Enigo = enigo::Enigo::new(&enigo::Settings::default()).unwrap();
    enigo.location().unwrap_or((0, 0))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_coords])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
