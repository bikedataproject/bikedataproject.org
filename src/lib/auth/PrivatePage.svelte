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
{:catch}
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <p class="text-gray-600 mb-4">Unable to verify your session.</p>
            <button onclick={() => window.location.reload()} class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover cursor-pointer">
                Try again
            </button>
        </div>
    </div>
{/await}
