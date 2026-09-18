<script lang="ts">
  import { GradientButton, Button } from "flowbite-svelte";
  import { hiddenStore, type History } from "$lib/database";
  import { prepare, match_positions } from "$lib/fuzzy";
  import ContextMenu from "$lib/HistoryContextMenu.svelte";
  import {
    writeImageBase64,
    writeHtml,
    writeText,
  } from "tauri-plugin-clipboard-api";
  export let history: History[];
  export let search = "";
  let selectedItem: History = { data_type: "text", value: "" };
  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, w: 0 };
  // browser/window dimension (height and width)
  let browser = { h: 0, w: 0 };
  // showMenu is state of context-menu visibility
  let showMenu = false;

  export function rightClickContextMenu(e: MouseEvent, item: History) {
    selectedItem = item;
    showMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }
  function filterHidenItems(item: string): string {
    let filteredItem = item;
    $hiddenStore.forEach((secret) => {
      filteredItem = filteredItem.replaceAll(secret.value, secret.display);
    });
    return filteredItem;
  }

  type Segment = { text: string; hit: boolean };

  // Positions are computed against `text` as passed in, so callers must
  // pass the already-redacted display string - filterHidenItems() changes
  // string length via replaceAll, which would shift indices computed
  // against the raw value.
  function highlightSegments(text: string, query: string): Segment[] {
    if (query === "") return [{ text, hit: false }];
    const positions = new Set(match_positions(query, prepare(text)));
    if (positions.size === 0) return [{ text, hit: false }];

    const segments: Segment[] = [];
    let cur = "";
    let curHit = positions.has(0);
    for (let i = 0; i < text.length; i++) {
      const hit = positions.has(i);
      if (hit !== curHit) {
        segments.push({ text: cur, hit: curHit });
        cur = "";
        curHit = hit;
      }
      cur += text[i];
    }
    segments.push({ text: cur, hit: curHit });
    return segments;
  }
</script>

{#each history as item}
  <div
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e, item)}
    role="contentinfo"
    class="flex"
  >
    {#if item.data_type == "text" && item.value.trim() != ""}
      <Button
        outline
        onclick={async (e: MouseEvent) => {
          e.preventDefault();
          if (e.ctrlKey) {
            return;
          }
          await writeText(item.value);
        }}
        size="xs"
        color={filterHidenItems(item.value) != item.value ? "purple" : "blue"}
        class="w-11/12 h-min-6 h-max-12 overflow-hidden m-auto mt-2 mb-2 text-gray-700 hover:text-gray-100 dark:text-gray-100"
      >
        <div
          class="w-full h-full max-h-8 overflow-hidden m-auto justify-center text-center"
        >
          <p class="text-xs">
            {#each highlightSegments(filterHidenItems(item.value), search) as seg}
              {#if seg.hit}<mark class="rounded-sm bg-yellow-300 text-black"
                  >{seg.text}</mark
                >{:else}{seg.text}{/if}
            {/each}
          </p>
        </div>
      </Button>
    {:else if item.data_type == "html"}
      <Button
        outline
        onclick={async (e: MouseEvent) => {
          if (e.ctrlKey) {
            return;
          }
          await writeHtml(item.value);
        }}
        color="red"
        size="xs"
        class="w-full h-min-6 h-max-12 overflow-hidden m-auto mt-2 mb-2"
      >
        {@html item.value}
      </Button>
    {:else if item.data_type == "image"}
      <GradientButton
        outline
        onclick={async () => {
          await writeImageBase64(item.value);
        }}
        color="lime"
        size="xs"
        class="w-72 h-min-6 h-max-24 overflow-hidden m-auto mt-2 mb-2"
      >
        <img
          class="w-full h-24"
          src="data:image/png;base64,{item.value}"
          alt="clipboarditem"
        />
      </GradientButton>
    {/if}
  </div>
{/each}

<ContextMenu bind:showMenu bind:pos bind:menu bind:item={selectedItem} />
<svelte:window
  on:click={(e: MouseEvent) => {
    if (e.ctrlKey) {
      return;
    }
    showMenu = false;
  }}
/>
