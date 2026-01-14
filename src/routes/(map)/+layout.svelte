<script lang="ts">
    import MapAlert from "$lib/map/components/alerts/MapAlert.svelte";

    let { children } = $props();
</script>

{@render children()}
