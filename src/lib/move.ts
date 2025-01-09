import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { cursorPosition } from "@tauri-apps/api/window";
import { get } from "svelte/store";
import { writable } from "svelte/store";
export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  console.log(get(scaleFactor), "scaleFactor");
  let coordsWindow = await cursorPosition();
  await appwindow.show();
  await appwindow.setFocus();
  coordsWindow.x = Math.round(coordsWindow.x);
  coordsWindow.y = Math.round(coordsWindow.y);
  console.log(coordsWindow);
  await appwindow.setPosition(coordsWindow.toLogical(get(scaleFactor)));
}

export const scaleFactor = writable(1);