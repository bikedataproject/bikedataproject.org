<script lang="ts">
    import { onMount } from "svelte";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    let accessDenied = $state(false);
    let usersTotal = $state<number | null>(null);
    let contributionsTotal = $state<number | null>(null);

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;

        const user = await appManager.authenticator.getUserIdOrRedirect();
        const token = user?.access_token;
        if (!token) return;

        const headers = { Authorization: "Bearer " + token };

        const [usersRes, contribRes] = await Promise.all([
            fetch(`${appManager.settings.api_url}/api/admin/users?offset=0&limit=1`, { headers }),
            fetch(`${appManager.settings.api_url}/api/admin/contributions?offset=0&limit=1`, { headers }),
        ]);

        if (usersRes.status === 403 || contribRes.status === 403) {
            accessDenied = true;
            return;
        }

        if (usersRes.ok) usersTotal = (await usersRes.json()).total;
        if (contribRes.ok) contributionsTotal = (await contribRes.json()).total;
    });
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-8 md:mt-16 px-6 md:px-[8vw] mb-16">
            <h2 class="mb-6">Admin</h2>

            {#if accessDenied}
                <div class="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                    <p class="text-red-700 font-semibold">Access denied. You do not have admin permissions.</p>
                </div>
            {:else}
                <div class="grid gap-4 sm:grid-cols-2 max-w-lg">
                    <a href="/admin/users" class="block p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                        <h3 class="text-lg font-bold text-gray-800">Users</h3>
                        <p class="text-sm text-gray-500 mt-1">
                            {#if usersTotal !== null}
                                {usersTotal.toLocaleString()} users
                            {:else}
                                Loading...
                            {/if}
                        </p>
                    </a>
                    <a href="/admin/contributions" class="block p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                        <h3 class="text-lg font-bold text-gray-800">Contributions</h3>
                        <p class="text-sm text-gray-500 mt-1">
                            {#if contributionsTotal !== null}
                                {contributionsTotal.toLocaleString()} contributions
                            {:else}
                                Loading...
                            {/if}
                        </p>
                    </a>
                </div>
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
