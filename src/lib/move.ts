import { getCurrentWindow, PhysicalPosition, type Window } from "@tauri-apps/api/window";
import { cursorPosition } from "@tauri-apps/api/window";
import { get } from "svelte/store";
import { platform } from "@tauri-apps/plugin-os";
import { writable } from "svelte/store";

/** Show, position at the cursor, and take keyboard focus. */
export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  let factor = await getFactor(appwindow);
  let coordsWindow = await cursorPosition();
  coordsWindow.x = Math.round(coordsWindow.x);
  coordsWindow.y = Math.round(coordsWindow.y);
  await appwindow.setPosition(coordsWindow.toLogical(factor));
  await FocusWindow();
}

/**
 * Bring the window to the front and give it keyboard focus. On macOS a hidden
 * app needs `show()` before `setFocus()` will actually grab the keyboard, and a
 * brief always-on-top toggle forces the WM to raise it above the previously
 * focused app.
 */
export async function FocusWindow() {
  const appwindow = getCurrentWindow();
  await appwindow.show();
  await appwindow.unminimize().catch(() => {});
  await appwindow.setAlwaysOnTop(true);
  await appwindow.setFocus();
  await appwindow.setAlwaysOnTop(false);
}

async function getFactor(appwindow: Window): Promise<number> {
  let family = platform();
  if (family === "macos") {
    return get(scaleFactor);
  }
  return await appwindow.scaleFactor();
}

export const scaleFactor = writable(1); 