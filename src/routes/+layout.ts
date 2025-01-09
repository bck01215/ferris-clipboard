// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://v2.tauri.app/start/frontend/sveltekit/ for more info
import { historyStore, get_all, get_all_saved, savedStore, get_all_hidden, hiddenStore } from "$lib/database";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { scaleFactor } from "$lib/move";
import { primaryMonitor } from "@tauri-apps/api/window";
declare global {
  interface Window {
    __TAURI__: any;
  }
}
export const prerender = true;
export const ssr = false;

export async function load() {
  let appwindow = getCurrentWindow();
  let localPrimaryMonitor = await primaryMonitor();
  let factor  = localPrimaryMonitor?.scaleFactor;
  console.log(factor, "from primary");

  scaleFactor.set(factor || await appwindow.scaleFactor());
  historyStore.set(await get_all());
  savedStore.set(await get_all_saved());
  hiddenStore.set(await get_all_hidden());
  return {};
}
