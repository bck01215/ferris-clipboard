<script lang="ts">
  import "../app.css";
  import { DarkMode } from "flowbite-svelte";
  import { CircleMinusSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onDestroy, onMount } from "svelte";
  import { MoveWindowToCursor } from "$lib/move";
  import { add_item } from "$lib/database";
  const appWindow = getCurrentWindow();
  import type { UnlistenFn } from "@tauri-apps/api/event";
  import {
    onHTMLUpdate,
    onImageUpdate,
    onTextUpdate,
    onSomethingUpdate,
    startListening,
  } from "tauri-plugin-clipboard-api";
  const { register, unregister } = window.__TAURI__.globalShortcut;
  let unlisten: UnlistenFn;
  let unlistenTextUpdate: UnlistenFn;
  let unlistenImageUpdate: UnlistenFn;
  // let unlistenHtmlUpdate: UnlistenFn;
  // let unlistenSomethingUpdate: UnlistenFn;
  onMount(async () => {
    // unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
    //   if (!focused) {
    //     appWindow.hide();
    //   }
    // });
    unlistenTextUpdate = await onTextUpdate(async (event) => {
      console.log("found text");
      add_item({ data_type: "text", value: event });
    });
    unlistenImageUpdate = await onImageUpdate(async (event) => {
      console.log("found image");
      add_item({ data_type: "image", value: event });
    });
    // unlistenHtmlUpdate = await onHTMLUpdate(async (event) => {
    //   console.log("found html");
    //   add_item({ data_type: "html", value: event });
    // });



    try {
      await unregister("Shift+space");
    } catch {
      console.log("No registered shortcut");
    }
    await register("Shift+space", async () => {
      console.log("Shortcut triggered");
      await MoveWindowToCursor();
    });
    startListening();
  });
  onDestroy(async () => {
    await unregister("Shift+space");
    unlistenTextUpdate();
    unlistenImageUpdate();
    // unlistenHtmlUpdate();
  });
</script>

<div data-tauri-drag-region class="titlebar m-b2">
  <div class="titlebar-button" id="titlebar-minimize">
    <button
      type="button"
      on:click={() => appWindow.hide()}
      class="text-yellow-400 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-300 dark:hover:bg-opacity-25 focus:outline-none rounded-lg text-sm p-2.5"
    >
      <CircleMinusSolid />
    </button>
  </div>
  <div class="titlebar-button" id="titlebar-mode">
    <DarkMode />
  </div>
  <div class="titlebar-button" id="titlebar-close">
    <button
      on:click={() => appWindow.hide()}
      type="button"
      class="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-300 dark:hover:bg-opacity-25 focus:outline-none rounded-lg text-sm p-2.5"
    >
      <CloseCircleSolid />
    </button>
  </div>
</div>

<div class="w-screen h-screen m-auto overflow-x-hidden pb-8 container">
  <slot />
</div>

<style>
  .titlebar {
    height: 30px;
    background: #ffffff00;
    user-select: none;
    display: flex;
    justify-content: flex-end;
    top: 0;
    left: 0;
    right: 0;
  }
  .titlebar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    user-select: none;
    -webkit-user-select: none;
  }
  :global(html) {
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .container {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
}
.container::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
}
</style>
