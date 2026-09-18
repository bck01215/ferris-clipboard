<script lang="ts">
  import { hiddenStore, type History } from "$lib/database";
  import { prepare, match_positions } from "$lib/fuzzy";
  import ContextMenu from "$lib/HistoryContextMenu.svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import {
    writeImageBase64,
    writeHtml,
    writeText,
  } from "tauri-plugin-clipboard-api";
  const appWindow = getCurrentWindow();
  export let history: History[];
  export let search = "";
  export let selectedIndex = 0;

  // Reset the highlight whenever the caller hands us a new list (a fresh
  // search query, or the underlying store updating) - but not just because
  // selectedIndex itself changed via arrow keys.
  let prevHistory: History[] | undefined;
  $: if (history !== prevHistory) {
    selectedIndex = 0;
    prevHistory = history;
  }

  let rowEls: HTMLDivElement[] = [];
  $: rowEls[selectedIndex]?.scrollIntoView({ block: "nearest" });

  async function paste(item: History): Promise<void> {
    if (item.data_type === "text") {
      await writeText(item.value);
    } else if (item.data_type === "html") {
      await writeHtml(item.value);
    } else if (item.data_type === "image") {
      await writeImageBase64(item.value);
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (history.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, history.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = history[selectedIndex];
      if (item) {
        paste(item).then(() => appWindow.hide());
      }
    }
  }

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

{#each history as item, i}
  {@const isSecret = filterHidenItems(item.value) != item.value}
  <div
    bind:this={rowEls[i]}
    oncontextmenu={(e: MouseEvent) => {
      e.preventDefault();
      rightClickContextMenu(e, item);
    }}
    role="contentinfo"
    class="mx-2 my-0.5 border-l-2 {isSecret
      ? 'border-purple-500'
      : 'border-transparent'}"
  >
    <button
      type="button"
      onclick={async (e: MouseEvent) => {
        e.preventDefault();
        if (e.ctrlKey) {
          return;
        }
        await paste(item);
      }}
      class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors {i ===
      selectedIndex
        ? 'bg-blue-500/10'
        : 'hover:bg-black/5 dark:hover:bg-white/10'}"
    >
      {#if item.data_type == "text" && item.value.trim() != ""}
        <p
          class="line-clamp-2 flex-1 overflow-hidden text-xs text-gray-700 dark:text-gray-100"
        >
          {#each highlightSegments(filterHidenItems(item.value), search) as seg}
            {#if seg.hit}<mark class="rounded-sm bg-yellow-300 text-black"
                >{seg.text}</mark
              >{:else}{seg.text}{/if}
          {/each}
        </p>
      {:else if item.data_type == "html"}
        <div
          class="line-clamp-2 flex-1 overflow-hidden text-xs text-gray-700 dark:text-gray-100"
        >
          {@html item.value}
        </div>
      {:else if item.data_type == "image"}
        <img
          class="h-24 w-full rounded object-cover"
          src="data:image/png;base64,{item.value}"
          alt="clipboarditem"
        />
      {/if}
    </button>
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
  on:keydown={onKeydown}
/>
