<script lang="ts">
    import type { Snippet } from "svelte";

    let { question, children }: { question: string; children: Snippet } = $props();
    let open = $state(false);
</script>

<div class="border-b border-gray-200">
    <button
        type="button"
        class="w-full flex items-center justify-between py-4 text-left font-semibold text-gray-800 hover:text-primary transition-colors cursor-pointer"
        onclick={() => open = !open}
        aria-expanded={open}
    >
        <span>{question}</span>
        <svg
            class="flex-shrink-0 ml-4 size-5 transition-transform {open ? 'rotate-180' : ''}"
            fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    </button>
    {#if open}
        <div class="pb-4 text-gray-700 space-y-3">
            {@render children()}
        </div>
    {/if}
</div>
