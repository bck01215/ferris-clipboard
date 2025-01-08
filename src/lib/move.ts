import {  getCurrentWindow } from "@tauri-apps/api/window";
import { cursorPosition } from "@tauri-apps/api/window";
export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  let coordsWindow = await cursorPosition();
  await appwindow.show();
  await appwindow.setFocus();
  await appwindow.setPosition(coordsWindow);
}
