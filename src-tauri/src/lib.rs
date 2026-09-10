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
        Migration {
            version: 2,
            description: "auto_prune_history",
            sql: "
                -- Keep the history table bounded: whenever a row is inserted,
                -- delete the oldest rows beyond the most recent HISTORY_MAX_ROWS.
                CREATE TRIGGER IF NOT EXISTS prune_history AFTER INSERT ON history
                BEGIN
                    DELETE FROM history
                    WHERE id <= (
                        SELECT id FROM history
                        ORDER BY id DESC
                        LIMIT 1 OFFSET 5000
                    );
                END;
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "settings_and_saved_hotkeys",
            sql: "
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                INSERT OR IGNORE INTO settings (key, value)
                    VALUES ('toggle_shortcut', 'Shift+Space');
                ALTER TABLE saved ADD COLUMN hotkey TEXT;
            ",
            kind: MigrationKind::Up,
        },
    ];
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
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
