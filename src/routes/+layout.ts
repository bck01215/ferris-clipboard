// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import { historyStore, get_all, get_all_saved, savedStore, get_all_hidden, hiddenStore } from "$lib/database";
declare global {
  interface Window {
    __TAURI__: any;
  }
}
export const prerender = true;
export const ssr = false;

export async function load() {
  historyStore.set(await get_all());
  savedStore.set(await get_all_saved());
  hiddenStore.set(await get_all_hidden());
  return {};
}
