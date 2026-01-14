<script lang="ts">
    import {appManager} from "$lib/AppManager.js";
</script>

{#await appManager.isAdmin() then value}
    {#if value}
        <slot/>
    {/if}
{/await}