import { getCurrentWebview } from "@tauri-apps/api/webview";
import { invoke } from "@tauri-apps/api/core";
import { LogicalPosition, getCurrentWindow } from "@tauri-apps/api/window";

export async function MoveWindowToCursor() {
  const appwindow = getCurrentWindow();
  let coords: [number, number] = await invoke("get_coords");
  console.log(coords);
  const logicalPosition: LogicalPosition = new LogicalPosition({
    x: coords[0],
    y: coords[1],
  });
  await appwindow.show();
  await appwindow.setFocus();
  await appwindow.setPosition(logicalPosition);
}
