<script lang="ts">
    import { add_hidden, hiddenStore, delete_hidden } from "$lib/database";
    import { Toast } from "flowbite-svelte";
    import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";

    let display = "";
    let value = "";
    let message = "";
    let success = true;

    let pendingDelete: { display: string; value: string } | null = null;

    function confirmDelete() {
        if (!pendingDelete) return;
        delete_hidden(pendingDelete.value);
        pendingDelete = null;
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (display && value && display !== value) {
            await add_hidden(display, value);
            success = true;
            message = "Secret added successfully";
        } else {
            success = false;
            message = "Make the secret different from the display name";
        }
    }

    const fieldClass =
        "w-full rounded-lg border border-gray-200/70 bg-white/70 p-2 text-xs text-gray-900 backdrop-blur-md focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600/60 dark:bg-black/20 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500";
</script>

<div class="flex w-screen flex-col gap-3 p-3 text-xs">
    {#if message}
        <Toast color={success ? "green" : "red"}>
            {#snippet icon()}
                {#if success}
                    <CheckCircleSolid class="w-4 h-4" />
                {:else}
                    <CloseCircleSolid class="w-4 h-4" />
                {/if}
            {/snippet}
            <span class="text-xs">{message}</span>
        </Toast>
    {/if}

    <form onsubmit={handleSubmit} class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
            <label for="display" class="font-medium text-gray-700 dark:text-gray-200"
                >Display</label
            >
            <input
                id="display"
                type="text"
                bind:value={display}
                placeholder="Enter display name"
                required
                class={fieldClass}
            />
        </div>
        <div class="flex flex-col gap-1">
            <label for="value" class="font-medium text-gray-700 dark:text-gray-200"
                >Secret</label
            >
            <input
                id="value"
                type="password"
                bind:value={value}
                placeholder="Enter secret value"
                required
                class={fieldClass}
            />
        </div>
        <button
            type="submit"
            class="w-full rounded-md bg-blue-500 px-3 py-2 text-left font-medium text-white transition-colors hover:bg-blue-600"
        >
            Add Secret
        </button>
    </form>

    {#if $hiddenStore.length > 0}
        <div class="flex flex-col gap-1">
            {#each $hiddenStore as hiddenItem}
                <button
                    type="button"
                    onclick={() => (pendingDelete = hiddenItem)}
                    class="flex w-full items-center rounded-md px-3 py-2 text-left text-gray-700 transition-colors hover:bg-black/5 hover:text-red-500 dark:text-gray-100 dark:hover:bg-white/10 dark:hover:text-red-400"
                >
                    Delete {hiddenItem.display}
                </button>
            {/each}
        </div>
    {/if}
</div>

{#if pendingDelete}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        role="button"
        tabindex="-1"
        onclick={() => (pendingDelete = null)}
        onkeydown={(e) => e.key === "Escape" && (pendingDelete = null)}
    >
        <div
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            class="w-56 rounded-lg border border-gray-200/70 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-md dark:border-gray-600/60 dark:bg-black/90 dark:text-white"
        >
            <p class="mb-3 text-gray-700 dark:text-gray-100">
                Delete <span class="font-medium">{pendingDelete.display}</span
                >?
            </p>
            <div class="flex justify-end gap-2">
                <button
                    type="button"
                    onclick={() => (pendingDelete = null)}
                    class="rounded-md px-2 py-1 text-gray-700 transition-colors hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onclick={confirmDelete}
                    class="rounded-md bg-red-500 px-2 py-1 font-medium text-white transition-colors hover:bg-red-600"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
{/if}
