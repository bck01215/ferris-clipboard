<script>
  import { Tabs, TabItem } from "flowbite-svelte";
  import History from "$lib/History.svelte";
</script>

<Tabs class="w-screen flex" contentClass="w-full p-0 mt-4">
  <TabItem title="History" open class="flex-1">
    <History />
  </TabItem>
  <TabItem title="Overrides" class="flex-2">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      <b>Profile:</b>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua.
    </p>
  </TabItem>
  <TabItem title="Saved" class="flex-3">
    <p class="text-sm text-gray-500 dark:text-gray-400">
      <b>Settings:</b>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna aliqua.
    </p>
  </TabItem>
</Tabs>
