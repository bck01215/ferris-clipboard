<script lang="ts">
  import { onMount } from "svelte";
  import { Toast } from "flowbite-svelte";
  import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";
  import HotkeyRecorder from "$lib/HotkeyRecorder.svelte";
  import {
    get_setting,
    set_setting,
    TOGGLE_SHORTCUT_KEY,
    DEFAULT_TOGGLE_SHORTCUT,
  } from "$lib/database";
  import { sync_shortcuts } from "$lib/shortcuts";

  let toggleShortcut: string | null = DEFAULT_TOGGLE_SHORTCUT;
  let message = "";
  let success = true;

  onMount(async () => {
    toggleShortcut = await get_setting(
      TOGGLE_SHORTCUT_KEY,
      DEFAULT_TOGGLE_SHORTCUT,
    );
  });

  async function onChange(e: CustomEvent<string | null>) {
    const next = e.detail ?? DEFAULT_TOGGLE_SHORTCUT;
    toggleShortcut = next;
    await set_setting(TOGGLE_SHORTCUT_KEY, next);
    await sync_shortcuts();
    success = true;
    message = `Toggle shortcut set to ${next}`;
  }
</script>

<div class="flex w-screen flex-col gap-3 p-3 text-xs">
  {#if message}
    <Toast on:close={() => (message = "")} color={success ? "green" : "red"}>
      <svelte:fragment slot="icon">
        {#if success}
          <CheckCircleSolid class="w-4 h-4" />
        {:else}
          <CloseCircleSolid class="w-4 h-4" />
        {/if}
      </svelte:fragment>
      <span class="text-xs">{message}</span>
    </Toast>
  {/if}

  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between gap-2">
      <p class="font-medium text-gray-700 dark:text-gray-200">
        Show / hide window
      </p>
      <HotkeyRecorder value={toggleShortcut} on:change={onChange} />
    </div>
    <p class="text-[11px] leading-tight text-gray-500">
      Global shortcut that brings the clipboard to your cursor.
    </p>
  </div>
</div>
