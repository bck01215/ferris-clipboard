<script>
  import { Tabs, TabItem } from "flowbite-svelte";
  import History from "$lib/History.svelte";
  import Saved from "$lib/Saved.svelte";
  import Overrides from "$lib/Overrides.svelte";
  import Settings from "$lib/Settings.svelte";
  import { CogOutline } from "flowbite-svelte-icons";
</script>

<Tabs
  class="w-screen flex text-xs"
  contentClass="w-full p-0 mt-4"
  defaultClass="flex flex-nowrap"
>
  <TabItem title="History" open>
    <History />
  </TabItem>
  <TabItem title="Overrides">
    <Overrides />
  </TabItem>
  <TabItem title="Saved">
    <Saved />
  </TabItem>
  <TabItem>
    <span slot="title" class="flex items-center" title="Settings">
      <CogOutline class="w-4 h-4" />
    </span>
    <Settings />
  </TabItem>
</Tabs>
