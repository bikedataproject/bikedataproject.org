<script lang="ts">
    import {appManager} from "$lib/AppManager";

    async function signin() {
        const result = await appManager.authenticator.signinSilentCallback();

        if (result){
            console.log("Silent signing succeeded");
        } else {
            console.log("Silent signin did not succeed");
        }
    }
</script>

{#await signin()}
    <div></div>
{/await}
