<script lang="ts">
    import "../app.css";
    import type {LayoutProps} from "../../.svelte-kit/types/src/routes/(app)/$types";
    import {beforeNavigate} from "$app/navigation";
    import {appManager} from "$lib/AppManager";

    let {children}: LayoutProps = $props();

    beforeNavigate((e) => {
        const callback = appManager.checkIsDirtyBeforeUnload();
        if (callback === undefined) return;

        e.cancel();
        if (!e.willUnload) callback();
    });
</script>

<svelte:head>
    <title>Bike Data Project</title>
</svelte:head>

{@render children()}
