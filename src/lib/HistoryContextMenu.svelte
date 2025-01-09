<script lang="ts">
    import  { type History, add_saved, delete_saved } from "$lib/database";

    export let item: History;
    // pos is cursor position when right click occur
    export let pos = { x: 0, y: 0 }
    // menu is dimension (height and width) of context menu
    export let menu = { h: 0, w: 0 }
    // showMenu is state of context-menu visibility
    export let showMenu = false;
    function getContextMenuDimension(node: HTMLElement){
        // This function will get context menu dimension
        // when navigation is shown => showMenu = true
        let height = node.offsetHeight
        let width = node.offsetWidth
        menu = {
            h: height,
            w: width
        }
    }
    function addItem(){
        add_saved(item)
    }
    function remove(){
        delete_saved(item.value);
    }
    let menuItems = [
        {
            'name': 'emptyicons',
            'onClick': addItem,
            'displayText': "Save item",
            'class': 'text-blue-500 hover:text-blue-700'
        },
        {
            'name': 'trash',
            'onClick': remove,
            'displayText': "Remove item",
            'class': 'text-red-500 hover:text-red-700'
        },
    ]

</script>

{#if showMenu}
<nav
  use:getContextMenuDimension
  style="position: absolute; top: {pos.y}px; left: {pos.x}px"
  class="bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"  >
  <div class="p-2">
    <ul>
      {#each menuItems as item}
        <li class="mb-1 last:mb-0">
          <button
            on:click={item.onClick}
            class={`flex items-center w-full px-4 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-700  ${
              item.class 
            }`}
          >
            <i class={`mr-3 ${item.class}`}></i>
            {item.displayText}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</nav>
{/if}
