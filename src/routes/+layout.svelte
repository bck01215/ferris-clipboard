<script>
  import "../app.css";
  import { DarkMode } from "flowbite-svelte";
  import { CircleMinusSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import { MoveWindowToCursor } from "$lib/move";

  const appWindow = getCurrentWindow();
  const { register, unregister } = window.__TAURI__.globalShortcut;
  onMount(async () => {
    await unregister("Shift+space");
    await register("Shift+space", async () => {
      console.log("Shortcut triggered");
      await MoveWindowToCursor();
    });
  });
</script>

<div data-tauri-drag-region class="titlebar">
  <div class="titlebar-button" id="titlebar-minimize">
    <button
      type="button"
      on:click={() => appWindow.minimize()}
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

<div class="p-8 w-screen h-screen bg-red">
  <slot />
</div>

<style>
  .titlebar {
    height: 30px;
    background: #ffffff00;
    user-select: none;
    display: flex;
    justify-content: flex-end;
    position: fixed;
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
</style>
