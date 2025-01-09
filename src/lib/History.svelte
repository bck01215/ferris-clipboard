<script lang="ts">
  import { historyStore } from "$lib/database";
  import { GradientButton } from "flowbite-svelte";
  import { writeImageBase64, writeHtml, writeText } from "tauri-plugin-clipboard-api";
</script>

{#each $historyStore as item }
  {#if item.data_type == "text"}
    <GradientButton
      outline
      on:click={async () => {
        await writeText(item.value);
      }}
      size="xs"
      color="teal"
      class="w-72 h-min-6 h-max-12 overflow-hidden m-auto mt-2 mb-2"
    >
      <div
        class="w-full max-h-8 overflow-hidden m-auto justify-center text-center"
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
      <div
        class="w-full max-h-8 overflow-hidden m-auto justify-center text-center"
      >
        {@html item.value}
      </div>
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
{/each}
