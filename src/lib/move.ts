import {
  getCurrentWindow,
  LogicalPosition,
  PhysicalPosition,
  cursorPosition,
  monitorFromPoint,
  primaryMonitor,
  type Monitor,
} from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";

/**
 * Show, position at the cursor, and take keyboard focus.
 *
 * The window is clamped to the bounds of whichever monitor the cursor is
 * actually on — if the cursor is near an edge, the window shifts
 * up/down/left/right as needed to stay fully on that monitor rather than
 * spilling onto a neighboring one.
 */
export async function MoveWindowToCursor() {
  if (platform() === "macos") {
    await moveOnMacos();
  } else {
    await moveByPhysicalPixels();
  }
  await FocusWindow();
}

/**
 * macOS's window backend (tao/winit) is inconsistent about what a
 * "physical pixel" means across displays with different scale factors:
 *  - `cursorPosition()` always multiplies by the PRIMARY monitor's scale
 *    factor, regardless of which monitor the cursor is actually on.
 *  - Each `Monitor`'s `position`/`size` are multiplied by THAT monitor's
 *    own scale factor.
 *  - `monitorFromPoint()` on macOS ignores scale entirely and expects raw
 *    logical (point) coordinates, comparing them straight against
 *    `CGDisplayBounds`.
 * Mixing these "physical" values directly — as a naive cross-platform
 * implementation does — is off by exactly the scale-factor ratio whenever
 * the cursor is on a non-primary display with a different DPI (e.g. an
 * external 1x monitor next to a 2x Retina built-in). That's what produced
 * both the wildly-wrong x placement and the lack of edge protection.
 *
 * The fix: convert everything to logical (point) coordinates — a single,
 * DPI-independent space shared by every monitor — before doing any
 * comparison or arithmetic, and hand `setPosition` a `LogicalPosition` so
 * it never has to be reasoned about again.
 */
async function moveOnMacos() {
  const appwindow = getCurrentWindow();
  const cursor = await cursorPosition();
  const primary = await primaryMonitor();
  const primaryScale = primary?.scaleFactor ?? 1;
  const cursorPoint = {
    x: cursor.x / primaryScale,
    y: cursor.y / primaryScale,
  };

  const monitor = await monitorFromPoint(cursorPoint.x, cursorPoint.y);

  if (monitor) {
    const pos = toLogicalRect(monitor);
    const outer = (await appwindow.outerSize()).toLogical(
      await appwindow.scaleFactor(),
    );

    const minX = pos.x;
    const minY = pos.y;
    const maxX = Math.max(minX, minX + pos.width - outer.width);
    const maxY = Math.max(minY, minY + pos.height - outer.height);
    const x = Math.min(Math.max(cursorPoint.x, minX), maxX);
    const y = Math.min(Math.max(cursorPoint.y, minY), maxY);
    await appwindow.setPosition(new LogicalPosition(x, y));
  } else {
    await appwindow.setPosition(new LogicalPosition(cursorPoint.x, cursorPoint.y));
  }
}

function toLogicalRect(monitor: Monitor) {
  return {
    x: monitor.position.x / monitor.scaleFactor,
    y: monitor.position.y / monitor.scaleFactor,
    width: monitor.size.width / monitor.scaleFactor,
    height: monitor.size.height / monitor.scaleFactor,
  };
}

/**
 * Windows/Linux report cursor position, monitor bounds, and `monitorFromPoint`
 * all in one consistent physical-pixel space, so no logical-coordinate
 * conversion is needed — just clamp directly in physical pixels.
 */
async function moveByPhysicalPixels() {
  const appwindow = getCurrentWindow();
  const cursor = await cursorPosition();
  const monitor = await monitorFromPoint(cursor.x, cursor.y);

  if (monitor) {
    const outer = await appwindow.outerSize();
    const minX = monitor.position.x;
    const minY = monitor.position.y;
    const maxX = Math.max(minX, minX + monitor.size.width - outer.width);
    const maxY = Math.max(minY, minY + monitor.size.height - outer.height);
    const x = Math.round(Math.min(Math.max(cursor.x, minX), maxX));
    const y = Math.round(Math.min(Math.max(cursor.y, minY), maxY));
    await appwindow.setPosition(new PhysicalPosition(x, y));
  } else {
    await appwindow.setPosition(
      new PhysicalPosition(Math.round(cursor.x), Math.round(cursor.y)),
    );
  }
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
