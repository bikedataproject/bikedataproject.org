<script lang="ts">
    import HomeIcon from "$lib/svg/icons/HomeIcon.svelte";
    import Header from "$lib/layout/Header.svelte";
    import Page from "$lib/layout/Page.svelte";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import type {PageProps} from "./$types";
    import {appManager} from "$lib/AppManager";

    let {data}: PageProps = $props();


    async function getWeather() {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (user === null) return;

        const response = await fetch("http://localhost:5292/weather", {
            headers: {
                Authorization: "Bearer " + user.access_token,
            },
        });

        console.log(response);

        return "the weather";
    }
</script>

<PrivatePage>
    <Header>
        <div class="flex items-center gap-x-6">
            <HomeIcon class="size-7 text-dark my-3"/>

            <h1>
                <div class="mt-1 text-base font-semibold text-dark">Dashboard</div>
                <div class="text-sm/6 text-gray-500">Your recent projects and activities.</div>
            </h1>
        </div>
    </Header>
    <Page>
        <div>
            something
            {#await getWeather()}
                <div>loading user</div>
            {:then weather}
                <div>
                    {weather}
                </div>
            {/await}
        </div>
    </Page>
</PrivatePage>