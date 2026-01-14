<script lang="ts">
    let className: string = "";
    export {className as class};
    export let style: string = "";
</script>

<svg
        {style}
        class="stroke-[1.5] {className}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>
