<script lang="ts">
  import { historyStore } from "$lib/database";
  import Contents from "$lib/Contents.svelte";
  let search = "";
</script>

<div class="mb-6">
  <input
    type="text"
    placeholder="Search"
    bind:value={search}
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    class="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
  />
</div>

<Contents
  history={$historyStore.filter((item) => {
    if (search == "") return true;
    return item.value.includes(search) && item.data_type == "text";
  })}
/>
