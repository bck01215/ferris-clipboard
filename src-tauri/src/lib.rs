use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY,
                    data_type TEXT NOT NULL,
                    value BLOB NOT NULL
                );
                CREATE TABLE IF NOT EXISTS secrets (
                    id INTEGER PRIMARY KEY,
                    display TEXT NOT NULL,
                    value BLOB NOT NULL
                );
                CREATE TABLE IF NOT EXISTS saved (
                    id INTEGER PRIMARY KEY,
                    data_type TEXT NOT NULL,
                    value BLOB NOT NULL
                );
            ",
            kind: MigrationKind::Up,
        },
    ];
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:clipboard.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        //        .invoke_handler(tauri::generate_handler![get_coords])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
