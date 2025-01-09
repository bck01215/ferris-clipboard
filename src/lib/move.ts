import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { cursorPosition } from "@tauri-apps/api/window";
export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  let coordsWindow = await cursorPosition();
  await appwindow.show();
  await appwindow.setFocus();
  coordsWindow.x = Math.round(coordsWindow.x);
  coordsWindow.y = Math.round(coordsWindow.y);
  console.log(coordsWindow);
  await appwindow.setPosition(coordsWindow.toLogical(2));
}
