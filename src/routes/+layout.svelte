<script lang="ts">
  import "../app.css";
  import { DarkMode } from "flowbite-svelte";
  import { CircleMinusSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onDestroy, onMount } from "svelte";
  import { add_item } from "$lib/database";
  const appWindow = getCurrentWindow();
  import type { UnlistenFn } from "@tauri-apps/api/event";
  import { savedStore } from "$lib/database";
  import { sync_shortcuts, teardown_shortcuts } from "$lib/shortcuts";
  import { searchFocusRequest } from "$lib/focus";
  import {
    onHTMLUpdate,
    onImageUpdate,
    onTextUpdate,
    onSomethingUpdate,
    startListening,
  } from "tauri-plugin-clipboard-api";
  let unlisten: UnlistenFn;
  let unlistenTextUpdate: UnlistenFn;
  let unlistenImageUpdate: UnlistenFn;
  // let unlistenHtmlUpdate: UnlistenFn;
  // let unlistenSomethingUpdate: UnlistenFn;
  onMount(async () => {
    // DarkMode hardcodes tabindex=0 on its own button, so a passed-in prop
    // can't override it — drop it out of tab order here instead.
    document
      .querySelector<HTMLButtonElement>("#titlebar-mode button")
      ?.setAttribute("tabindex", "-1");

    await appWindow.setVisibleOnAllWorkspaces(true);
    unlisten = await getCurrentWindow().onFocusChanged(
      ({ payload: focused }) => {
        if (focused) {
          searchFocusRequest.update((n) => n + 1);
        } else {
          appWindow.hide();
        }
      },
    );
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

    await sync_shortcuts();
    // Re-register saved-item hotkeys whenever the saved list changes.
    unsubscribeSaved = savedStore.subscribe(() => {
      void sync_shortcuts();
    });
    startListening();
  });
  let unsubscribeSaved: (() => void) | undefined;
  function onWindowKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      appWindow.hide();
    }
  }
  onDestroy(async () => {
    unsubscribeSaved?.();
    await teardown_shortcuts();
    unlistenTextUpdate();
    unlistenImageUpdate();
    unlisten();
    // unlistenHtmlUpdate();
  });
</script>

<svelte:window on:keydown={onWindowKeydown} />

<div
  class="keepalive flex h-screen w-screen flex-col bg-white/90 backdrop-blur-xl dark:bg-black/50"
>
  <div data-tauri-drag-region class="titlebar m-b2">
    <div class="titlebar-button" id="titlebar-minimize">
      <button
        type="button"
        tabindex="-1"
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
        tabindex="-1"
        class="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-300 dark:hover:bg-opacity-25 focus:outline-none rounded-lg text-sm p-2.5"
      >
        <CloseCircleSolid />
      </button>
    </div>
  </div>

  <div class="w-screen flex-1 m-auto overflow-x-hidden overflow-y-auto pb-8 container">
    <slot />
  </div>
</div>

<style>
  .titlebar {
    height: 30px;
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
    opacity: 0.35;
    transition: opacity 150ms ease;
  }
  .titlebar:hover .titlebar-button {
    opacity: 1;
  }
  :global(html) {
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .container {
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
  }
  .container::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
  /* macOS/WKWebView stops recompositing backdrop-filter once mouse input
     goes idle, so the blur lags and the glass looks more transparent than
     it should. An imperceptible, always-running property change keeps the
     layer repainting so the blur (and transparency) stay constant. */
  .keepalive {
    animation: keepalive-repaint 1s linear infinite;
  }
  @keyframes keepalive-repaint {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.9999;
    }
  }
</style>
