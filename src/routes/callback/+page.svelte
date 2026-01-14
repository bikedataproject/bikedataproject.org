<script lang="ts">
    import {appManager} from "$lib/AppManager";

    async function signin() {
        window.location.href = (await appManager.authenticator.completeSignin()) || `${appManager.settings.public_url}`;
    }
</script>

{#await signin()}
    <div></div>
{/await}
