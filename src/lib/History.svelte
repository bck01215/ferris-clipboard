<script lang="ts">
  import { historyStore, type History } from "$lib/database";
  import { prepare, queryMask, score, type Candidate } from "$lib/fuzzy";
  import Contents from "$lib/Contents.svelte";
  import { searchFocusRequest } from "$lib/focus";

  const RENDER_CAP = 100;

  let search = "";
  let searchInput: HTMLInputElement;

  $: if ($searchFocusRequest >= 0) searchInput?.focus();

  $: candidates = $historyStore
    .filter((item) => item.data_type !== "image")
    .map((item) => ({ item, cand: prepare(item.value) }));

  $: query = search.trim().toLowerCase();

  $: results = (query === "" ? $historyStore : rank(candidates, query)).slice(
    0,
    RENDER_CAP,
  );

  function rank(
    candidates: { item: History; cand: Candidate }[],
    query: string,
  ): History[] {
    const qMask = queryMask(query);
    return candidates
      .map((c, i) => ({ item: c.item, s: score(query, qMask, c.cand), i }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.i - b.i) // score desc, then original recency
      .map((r) => r.item);
  }
</script>

<div class="mb-6">
  <input
    id="search-input"
    type="text"
    placeholder="Search"
    bind:value={search}
    bind:this={searchInput}
    tabindex="0"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    class="w-full rounded-lg border border-gray-200/70 bg-white/70 p-2 text-sm text-gray-900 backdrop-blur-md focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600/60 dark:bg-black/20 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
  />
</div>

<Contents history={results} search={query} />
