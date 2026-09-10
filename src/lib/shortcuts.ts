/**
 * Central registration for every global shortcut the app owns:
 *  - the configurable show/hide toggle, and
 *  - one accelerator per saved item that has a `hotkey` assigned (pressing it
 *    writes that item to the clipboard and focuses the window).
 *
 * Call `sync_shortcuts()` on startup and again whenever the toggle setting or
 * the saved store changes; it fully rebuilds the registration set so callers
 * never have to diff.
 */
import {
  register,
  unregisterAll,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { get } from "svelte/store";
import {
  writeImageBase64,
  writeHtml,
  writeText,
} from "tauri-plugin-clipboard-api";
import {
  savedStore,
  get_setting,
  TOGGLE_SHORTCUT_KEY,
  DEFAULT_TOGGLE_SHORTCUT,
  type History,
} from "$lib/database";
import { MoveWindowToCursor, FocusWindow } from "$lib/move";

async function paste_item(item: History): Promise<void> {
  if (item.data_type === "image") {
    await writeImageBase64(item.value);
  } else if (item.data_type === "html") {
    await writeHtml(item.value);
  } else {
    await writeText(item.value);
  }
}

let syncing = false;
let resyncQueued = false;

export async function sync_shortcuts(): Promise<void> {
  if (syncing) {
    resyncQueued = true;
    return;
  }
  syncing = true;
  try {
    await unregisterAll();

    const toggle = await get_setting(
      TOGGLE_SHORTCUT_KEY,
      DEFAULT_TOGGLE_SHORTCUT,
    );
    if (toggle) {
      await safe_register(toggle, async (e) => {
        if (e.state === "Pressed") await MoveWindowToCursor();
      });
    }

    for (const item of get(savedStore)) {
      if (!item.hotkey || item.hotkey === toggle) continue;
      const captured = item;
      await safe_register(item.hotkey, async (e) => {
        if (e.state !== "Pressed") return;
        await paste_item(captured);
        await FocusWindow();
      });
    }
  } finally {
    syncing = false;
    if (resyncQueued) {
      resyncQueued = false;
      void sync_shortcuts();
    }
  }
}

async function safe_register(
  accelerator: string,
  handler: Parameters<typeof register>[1],
): Promise<void> {
  try {
    if (await isRegistered(accelerator)) return;
    await register(accelerator, handler);
  } catch (err) {
    console.error(`Failed to register shortcut "${accelerator}":`, err);
  }
}

export async function teardown_shortcuts(): Promise<void> {
  try {
    await unregisterAll();
  } catch (err) {
    console.error("Failed to unregister shortcuts:", err);
  }
}
