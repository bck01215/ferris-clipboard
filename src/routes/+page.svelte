<script>
  import { Tabs, TabItem } from "flowbite-svelte";
  import History from "$lib/History.svelte";
  import Saved from "$lib/Saved.svelte";
  import Overrides from "$lib/Overrides.svelte";
</script>

<Tabs class="w-screen flex" contentClass="w-full p-0 mt-4">
  <TabItem title="History" open class="flex-1">
    <History />
  </TabItem>
  <TabItem title="Overrides" class="flex-2">
    <Overrides />
  </TabItem>
  <TabItem title="Saved" class="flex-3">
    <Saved />
  </TabItem>
</Tabs>
