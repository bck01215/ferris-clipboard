<script lang="ts">
    import { GradientButton } from "flowbite-svelte";
    import type { History } from "$lib/database";
    import ContextMenu from "$lib/HistoryContextMenu.svelte";
    import { writeImageBase64, writeHtml, writeText } from "tauri-plugin-clipboard-api";
    export let history: History[];
    let selectedItem: History = { data_type: "text", value: "" };
    // pos is cursor position when right click occur
    let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    let menu = { h: 0, w: 0 }
    // browser/window dimension (height and width)
    let browser = { h: 0, w: 0 }
    // showMenu is state of context-menu visibility
    let showMenu = false;

    export function rightClickContextMenu(e: MouseEvent, item: History){
        selectedItem = item
        showMenu = true
        browser = {
            w: window.innerWidth,
            h: window.innerHeight
        };
        pos = {
            x: e.clientX,
            y: e.clientY
        };
        // If bottom part of context menu will be displayed
        // after right-click, then change the position of the
        // context menu. This position is controlled by `top` and `left`
        // at inline style. 
        // Instead of context menu is displayed from top left of cursor position
        // when right-click occur, it will be displayed from bottom left.
        if (browser.h -  pos.y < menu.h)
            pos.y = pos.y - menu.h
        if (browser.w -  pos.x < menu.w)
            pos.x = pos.x - menu.w
    }


</script>
{#each history as item }
<div
on:contextmenu|preventDefault={(e) => rightClickContextMenu(e, item)} 
role="contentinfo"
>   

  {#if item.data_type == "text" && item.value.trim() != ""}
    <GradientButton
      outline
      on:click={async (e) => {
        e.preventDefault();
        await writeText(item.value);
      }}
      size="xs"
      color="teal"
      class="w-72 h-min-6 h-max-12 overflow-hidden m-auto mt-2 mb-2"
    >
      <div
      class="w-full h-full max-h-8 overflow-hidden m-auto justify-center text-center"
      >
        <p>{item.value}</p>
      </div>
    </GradientButton>
  {:else if item.data_type == "html"}
    <GradientButton
      outline
      on:click={async () => {
        await writeHtml(item.value);
      }}
      color="red"
      size="xs"
      class="w-72 h-min-6 h-max-12 overflow-hidden m-auto mt-2 mb-2"
    >
        {@html item.value}
    </GradientButton>
  {:else if item.data_type == "image"}
    <GradientButton
      outline
      on:click={async () => {
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


<ContextMenu bind:showMenu  bind:pos bind:menu bind:item={selectedItem}/>
<svelte:window
on:click={() => showMenu = false} />


