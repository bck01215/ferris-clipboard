<script lang="ts">
    import { savedStore } from "$lib/database";
    import Contents from "$lib/Contents.svelte";
  </script>
  

  <Contents history={$savedStore} />