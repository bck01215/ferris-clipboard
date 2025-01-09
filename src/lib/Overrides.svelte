<script lang="ts">
    import { Input, Button } from "flowbite-svelte";
    import { add_hidden, hiddenStore, delete_hidden } from "$lib/database";
    import { Toast } from 'flowbite-svelte';
    import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';

    let display = "";
    let value = "";
    let message = "";
    let success = true;

    async function handleSubmit() {
        if (display && value && display !== value) {
            await add_hidden(display, value);
            success = true;
            message = "Secret added successfully";
        } else {
            success = false;
            message = "Make the secret different from the display name";
        }
    }
</script>

<div class="flex w-screen flex-col mb-4 space-y-4">
    {#if message}
    <Toast on:close={() => message = "" } color="{success ? 'green' : 'red'}" contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700">
        <svelte:fragment slot="icon">
            {#if success}
            <CheckCircleSolid class="w-5 h-5" />
            {:else}
            <CloseCircleSolid class="w-5 h-5" />
            {/if}
            <span class="sr-only">Check icon</span>
        </svelte:fragment>
        {message}
    </Toast>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="flex space-x-4">
            <div class="flex-1">
                <label for="display" class="block text-sm font-medium text-gray-700">Display</label>
                <Input id="display" type="text" bind:value={display} placeholder="Enter display name" required />
            </div>
            <div class="flex-1">
                <label for="value" class="block text-sm font-medium text-gray-700">Secret</label>
                <Input id="value" type="password" bind:value={value} placeholder="Enter secret value" required />
            </div>
        </div>
        <Button type="submit" color="blue" class="w-full">Add Secret</Button>
    </form>
</div>

{#each $hiddenStore as hiddenItem}
    <Button outline type="submit" color="red" class="w-full mb-2 h-12 flex items-center overflow-hidden" on:click={() => delete_hidden(hiddenItem.value)}>Delete {hiddenItem.display}</Button>
{/each}