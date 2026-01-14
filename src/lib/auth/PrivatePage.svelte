<script lang="ts">
    import {appManager} from "$lib/AppManager.js";

    async function signedInOrRedirect(): Promise<boolean> {
        const signedIn = await appManager.authenticator.isSignedIn();

        if (!signedIn) {
            await appManager.authenticator.startSignin(`${window.location.pathname}${window.location.hash}`);
            return false;
        }
        return true;
    }
</script>

{#await signedInOrRedirect() then signedIn}
    {#if signedIn}
        <slot/>
    {/if}
{/await}
