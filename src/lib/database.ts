import Database, { type QueryResult } from "@tauri-apps/plugin-sql";
import { writable } from "svelte/store";

const db = Database.get("sqlite:clipboard.db");

export async function add_item(item: History): Promise<QueryResult> {
  const res = db.execute(
    "INSERT INTO history (data_type, value) VALUES ($1, $2)",
    [item.data_type, item.value],
  );
  await res;
    historyStore.set(await get_all());
  return res;
}

export async function add_saved(item: History): Promise<QueryResult> {
  const res = db.execute(
    "INSERT INTO saved (data_type, value) VALUES ($1, $2)",
    [item.data_type, item.value],
  );
  return res;
}
export async function delete_saved(value: string): Promise<QueryResult> {
  return db.execute("DELETE FROM saved WHERE value = $1", [value]);
}
export async function add_hidden(
  display: string,
  value: string,
): Promise<QueryResult> {
  return db.execute("INSERT INTO secrets (display, value) VALUES ($1, $2)", [
    display,
    value,
  ]);
}
export async function delete_hidden(value: string): Promise<QueryResult> {
  return db.execute("DELETE FROM secrets WHERE value = $1", [value]);
}

export async function get_all(): Promise<History[]> {
  return db.select(
    "SELECT DISTINCT data_type, value FROM history ORDER BY id DESC LIMIT 300",
  );
}

export async function get_all_saved(): Promise<QueryResult> {
  return db.select(
    "SELECT DISTINCT display, value FROM secrets ORDER BY id DESC",
  );
}

export async function get_all_hidden(): Promise<QueryResult> {
  return db.select(
    "SELECT DISTINCT display, value FROM secrets ORDER BY id DESC ",
  );
}

export async function get_all_like(search: string): Promise<QueryResult> {
  return db.select(
    "SELECT DISTINCT data_type, value FROM history WHERE data_type = 'text' AND value LIKE '%$1%' ORDER BY id DESC LIMIT 300",
    [search],
  );
}

export type History = {
  data_type: "text" | "image" | "html";
  value: string;
};

export const historyStore = writable<History[]>([]);
