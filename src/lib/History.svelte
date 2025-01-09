<script lang="ts">
  import { historyStore } from "$lib/database";
  import Contents from "$lib/Contents.svelte";
  import {Input} from "flowbite-svelte";
  let search= "";
</script>

<div class="mb-6">
    <Input id="small-input" size="sm" placeholder="Search" bind:value={search} />
</div>

<Contents history={$historyStore.filter((item) => {
    if (search == "") return true;
    return item.value.includes(search) && item.data_type == "text"
    })} />