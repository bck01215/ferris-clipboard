<script lang="ts">
  import { onMount } from "svelte";
  import { Tabs, TabItem } from "flowbite-svelte";
  import History from "$lib/History.svelte";
  import Saved from "$lib/Saved.svelte";
  import Overrides from "$lib/Overrides.svelte";
  import Settings from "$lib/Settings.svelte";
  import { CogOutline } from "flowbite-svelte-icons";

  const TAB_KEYS = ["history", "overrides", "saved", "settings"];
  let selected = "history";

  function onWindowKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey) {
      const index = TAB_KEYS.findIndex((_, i) => e.key === String(i + 1));
      if (index === -1) return;
      e.preventDefault();
      selected = TAB_KEYS[index];
      return;
    }

    // Bare Left/Right cycle tabs - but only when that wouldn't eat a cursor
    // move inside a text field the user is actively editing (an empty field
    // has nothing for the arrow to move through, so it's free to use).
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const target = e.target;
    const isNonEmptyTextField =
      (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement) &&
      target.value.length > 0;
    if (isNonEmptyTextField) return;

    e.preventDefault();
    const current = TAB_KEYS.indexOf(selected);
    const delta = e.key === "ArrowLeft" ? -1 : 1;
    selected = TAB_KEYS[(current + delta + TAB_KEYS.length) % TAB_KEYS.length];
  }

  onMount(() => {
    // TabItem forwards restProps to the <li>, not the tab <button>, so a
    // tabindex prop can't reach the actual focusable element — drop the
    // rendered tab triggers out of tab order via the DOM instead.
    document
      .querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .forEach((el) => (el.tabIndex = -1));
  });

  // Quiet, flat tab labels — no border/underline/rounded-top box, just a
  // small uppercase label that gets a subtle neutral fill when active.
  const activeTab =
    "px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide " +
    "text-gray-900 bg-black/10 dark:bg-white/10 dark:text-white";
  const inactiveTab =
    "px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wide " +
    "text-gray-400 hover:text-gray-600 hover:bg-black/5 " +
    "dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-300";
</script>

<svelte:window on:keydown={onWindowKeydown} />

<Tabs
  bind:selected
  divider={false}
  class="w-screen flex gap-1 px-2 pt-2 text-xs"
  contentClass="w-full p-0 mt-2 bg-transparent dark:bg-transparent"
  ulClass="flex flex-nowrap gap-1"
>
  <TabItem
    key="history"
    title="History"
    open
    activeClass={activeTab}
    inactiveClass={inactiveTab}
  >
    <History />
  </TabItem>
  <TabItem
    key="overrides"
    title="Overrides"
    activeClass={activeTab}
    inactiveClass={inactiveTab}
  >
    <Overrides />
  </TabItem>
  <TabItem
    key="saved"
    title="Saved"
    activeClass={activeTab}
    inactiveClass={inactiveTab}
  >
    <Saved />
  </TabItem>
  <TabItem
    key="settings"
    activeClass={activeTab}
    inactiveClass={inactiveTab}
  >
    {#snippet titleSlot()}
      <span class="flex items-center" title="Settings">
        <CogOutline class="w-4 h-4" />
      </span>
    {/snippet}
    <Settings />
  </TabItem>
</Tabs>
