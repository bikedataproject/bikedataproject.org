<script>
import PageSectionHeader from "$lib/layout/PageSectionHeader.svelte";
</script>

<div class="border-b border-gray-200 bg-white">
    {#if $$slots.header}
    <PageSectionHeader>
        <slot name="header"></slot>
    </PageSectionHeader>
    {/if}
    <slot name="content"></slot>
</div>
