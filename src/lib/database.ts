import Database, { type QueryResult } from "@tauri-apps/plugin-sql";
import { writable } from "svelte/store";

const db = Database.get("sqlite:clipboard.db");

/** Hard cap on the on-disk size of the history data before we prune (bytes). */
const HISTORY_MAX_BYTES = 100 * 1024 * 1024; // 100 MiB
/** How many of the oldest history rows to drop per prune pass. */
const PRUNE_BATCH = 200;

let pruning = false;

/**
 * Drop the oldest `history` rows until the database is back under
 * `HISTORY_MAX_BYTES`, then reclaim the freed pages. The migration-installed
 * trigger bounds the row count; this bounds the byte size (large image blobs).
 */
export async function prune_history(): Promise<boolean> {
  if (pruning) return false;
  pruning = true;
  let didPrune = false;
  try {
    while ((await db_size_bytes()) > HISTORY_MAX_BYTES) {
      const rows: { c: number }[] = await db.select(
        "SELECT COUNT(*) AS c FROM history",
      );
      if (!rows[0]?.c || rows[0].c <= PRUNE_BATCH) break;
      await db.execute(
        "DELETE FROM history WHERE id IN (SELECT id FROM history ORDER BY id ASC LIMIT $1)",
        [PRUNE_BATCH],
      );
      didPrune = true;
    }
    if (didPrune) {
      await db.execute("VACUUM");
      historyStore.set(await get_all());
    }
  } finally {
    pruning = false;
  }
  return didPrune;
}

async function db_size_bytes(): Promise<number> {
  const rows: { size: number }[] = await db.select(
    "SELECT page_count * page_size AS size FROM pragma_page_count(), pragma_page_size()",
  );
  return rows[0]?.size ?? 0;
}

export async function add_item(item: History): Promise<QueryResult> {
  const res = db.execute(
    "INSERT INTO history (data_type, value) VALUES ($1, $2)",
    [item.data_type, item.value],
  );
  await res;
  historyStore.set(await get_all());
  void prune_history();
  return res;
}

export async function add_saved(item: History): Promise<QueryResult> {
  const res = db.execute(
    "INSERT INTO saved (data_type, value) VALUES ($1, $2)",
    [item.data_type, item.value],
  );
  await res;
  savedStore.set(await get_all_saved());
  return res;
}
export async function delete_saved(value: string): Promise<QueryResult> {
  const res = db.execute("DELETE FROM saved WHERE value = $1", [value]);
  await res;
  savedStore.set(await get_all_saved());
  return res;
}

/**
 * Set (or clear, when `hotkey` is null) the global hotkey bound to a saved
 * item. Hotkeys are unique across saved items; assigning one that is already in
 * use clears it from the previous item first.
 */
export async function set_saved_hotkey(
  id: number,
  hotkey: string | null,
): Promise<QueryResult> {
  if (hotkey) {
    await db.execute("UPDATE saved SET hotkey = NULL WHERE hotkey = $1", [
      hotkey,
    ]);
  }
  const res = db.execute("UPDATE saved SET hotkey = $1 WHERE id = $2", [
    hotkey,
    id,
  ]);
  await res;
  savedStore.set(await get_all_saved());
  return res;
}
export async function add_hidden(
  display: string,
  value: string,
): Promise<QueryResult> {
  const res = db.execute("INSERT INTO secrets (display, value) VALUES ($1, $2)", [
    display,
    value,
  ]);
  await res;
  hiddenStore.set(await get_all_hidden());
  return res;
}
export async function delete_hidden(value: string): Promise<QueryResult> {
  const res = db.execute("DELETE FROM secrets WHERE value = $1", [value]);
  await res;
  hiddenStore.set(await get_all_hidden());
  return res;
}

export async function get_all(): Promise<History[]> {
  return db.select(
    "SELECT DISTINCT data_type, value FROM history ORDER BY id DESC LIMIT 5000",
  );
}

export async function get_all_saved(): Promise<History[]> {
  return db.select(
    "SELECT id, data_type, value, hotkey FROM saved ORDER BY id DESC",
  );
}

/** Read a setting, falling back to `fallback` when it has never been set. */
export async function get_setting(
  key: string,
  fallback: string,
): Promise<string> {
  const rows: { value: string }[] = await db.select(
    "SELECT value FROM settings WHERE key = $1",
    [key],
  );
  return rows[0]?.value ?? fallback;
}

export async function set_setting(
  key: string,
  value: string,
): Promise<QueryResult> {
  return db.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

/** Accelerator string for the global show/hide toggle. */
export const TOGGLE_SHORTCUT_KEY = "toggle_shortcut";
export const DEFAULT_TOGGLE_SHORTCUT = "Shift+Space";

export async function get_all_hidden(): Promise<Secret[]> {
  return db.select(
    "SELECT DISTINCT display, value FROM secrets ORDER BY id DESC ",
  );
}

export type History = {
  id?: number;
  data_type: "text" | "image" | "html";
  value: string;
  hotkey?: string | null;
};

export type Secret = {
  display: string;
  value: string;
};

export const historyStore = writable<History[]>([]);

export const savedStore = writable<History[]>([]);

export const hiddenStore = writable<Secret[]>([]);