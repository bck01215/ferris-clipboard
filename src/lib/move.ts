import { getCurrentWindow, PhysicalPosition, type Window } from "@tauri-apps/api/window";
import { cursorPosition } from "@tauri-apps/api/window";
import { get } from "svelte/store";
import { platform } from "@tauri-apps/plugin-os";
import { writable } from "svelte/store";
export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  let factor = await getFactor(appwindow);
  let coordsWindow = await cursorPosition();
  await appwindow.show();
  await appwindow.setFocus();
  coordsWindow.x = Math.round(coordsWindow.x);
  coordsWindow.y = Math.round(coordsWindow.y);
  console.log(coordsWindow);
  await appwindow.setPosition(coordsWindow.toLogical(factor));
}

async function getFactor(appwindow: Window): Promise<number> {
  let family = platform();
  if (family === "macos") {
    return get(scaleFactor);
  }
  return await appwindow.scaleFactor();
}

export const scaleFactor = writable(1); 