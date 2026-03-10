<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type AdminUser = { userId: string; username: string | null; email: string | null; contributionCount: number; totalDistanceKm: number; lastContribution: string; privacyLevel: string | null };
    type AdminContribution = { id: string; userId: string; username: string | null; provider: string; distanceKm: number | null; durationMinutes: number | null; startTime: string; privacyLevel: string | null };

    let accessDenied = $state(false);

    let users: AdminUser[] = $state([]);
    let usersTotal = $state(0);
    let usersOffset = $state(0);
    let usersLoading = $state(false);
    const usersLimit = 25;

    let contributions: AdminContribution[] = $state([]);
    let contributionsTotal = $state(0);
    let contributionsOffset = $state(0);
    let contributionsLoading = $state(false);
    const contributionsLimit = 25;

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;
        await Promise.all([loadUsers(), loadContributions()]);
    });

    async function getToken(): Promise<string | null> {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        return user?.access_token ?? null;
    }

    async function loadUsers() {
        usersLoading = true;
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/admin/users?offset=${usersOffset}&limit=${usersLimit}`,
                { headers: { Authorization: "Bearer " + token } }
            );
            if (res.status === 403) {
                accessDenied = true;
                return;
            }
            if (res.ok) {
                const data = await res.json();
                users = data.items;
                usersTotal = data.total;
            }
        } finally {
            usersLoading = false;
        }
    }

    async function loadContributions() {
        contributionsLoading = true;
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/admin/contributions?offset=${contributionsOffset}&limit=${contributionsLimit}`,
                { headers: { Authorization: "Bearer " + token } }
            );
            if (res.status === 403) {
                accessDenied = true;
                return;
            }
            if (res.ok) {
                const data = await res.json();
                contributions = data.items;
                contributionsTotal = data.total;
            }
        } finally {
            contributionsLoading = false;
        }
    }

    function formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    function formatDistance(km: number | null): string {
        if (km === null) return "\u2014";
        return `${km.toFixed(1)} km`;
    }

    function formatDuration(minutes: number | null): string {
        if (minutes === null) return "\u2014";
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return `${h}h ${m}m`;
    }

    function shortId(id: string): string {
        return id.substring(0, 8) + "\u2026";
    }
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-8 md:mt-16 px-6 md:px-[8vw] mb-16">
            <h2 class="mb-1">Admin</h2>

            {#if accessDenied}
                <div class="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                    <p class="text-red-700 font-semibold">Access denied. You do not have admin permissions.</p>
                </div>
            {:else}
                <!-- Users -->
                <div class="mb-10">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Users ({usersTotal})</h3>

                    {#if usersLoading}
                        <p class="text-gray-500 text-sm">Loading users...</p>
                    {:else if users.length > 0}
                        <div class="overflow-x-auto rounded-xl border border-gray-200">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                                    <tr>
                                        <th class="px-4 py-3">User</th>
                                        <th class="px-4 py-3">Contributions</th>
                                        <th class="px-4 py-3">Total Distance</th>
                                        <th class="px-4 py-3">Last Contribution</th>
                                        <th class="px-4 py-3">Privacy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each users as u (u.userId)}
                                        <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td class="px-4 py-3 text-gray-800" title={u.userId}>{u.username ?? u.email ?? shortId(u.userId)}</td>
                                            <td class="px-4 py-3 text-gray-700">{u.contributionCount}</td>
                                            <td class="px-4 py-3 text-gray-700">{formatDistance(u.totalDistanceKm)}</td>
                                            <td class="px-4 py-3 text-gray-700 whitespace-nowrap">{formatDate(u.lastContribution)}</td>
                                            <td class="px-4 py-3">
                                                <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{u.privacyLevel ?? "not set"}</span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <div class="flex items-center justify-between mt-3">
                            <span class="text-xs text-gray-500">
                                {usersOffset + 1}–{Math.min(usersOffset + usersLimit, usersTotal)} of {usersTotal}
                            </span>
                            <div class="flex gap-2">
                                <button
                                    disabled={usersOffset === 0}
                                    onclick={() => { usersOffset = Math.max(0, usersOffset - usersLimit); loadUsers(); }}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Previous</button>
                                <button
                                    disabled={usersOffset + usersLimit >= usersTotal}
                                    onclick={() => { usersOffset += usersLimit; loadUsers(); }}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Next</button>
                            </div>
                        </div>
                    {:else}
                        <p class="text-gray-500 text-sm">No users found.</p>
                    {/if}
                </div>

                <!-- Contributions -->
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Contributions ({contributionsTotal})</h3>

                    {#if contributionsLoading}
                        <p class="text-gray-500 text-sm">Loading contributions...</p>
                    {:else if contributions.length > 0}
                        <div class="overflow-x-auto rounded-xl border border-gray-200">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                                    <tr>
                                        <th class="px-4 py-3">Date</th>
                                        <th class="px-4 py-3">User</th>
                                        <th class="px-4 py-3">Distance</th>
                                        <th class="px-4 py-3">Duration</th>
                                        <th class="px-4 py-3">Provider</th>
                                        <th class="px-4 py-3">Privacy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each contributions as c (c.id)}
                                        <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onclick={() => goto(`/admin/contribution/${c.id}`)}>
                                            <td class="px-4 py-3 text-gray-800 whitespace-nowrap">{formatDate(c.startTime)}</td>
                                            <td class="px-4 py-3 text-gray-700" title={c.userId}>{c.username ?? shortId(c.userId)}</td>
                                            <td class="px-4 py-3 text-gray-700">{formatDistance(c.distanceKm)}</td>
                                            <td class="px-4 py-3 text-gray-700">{formatDuration(c.durationMinutes)}</td>
                                            <td class="px-4 py-3">
                                                <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c.provider}</span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c.privacyLevel ?? "account"}</span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <div class="flex items-center justify-between mt-3">
                            <span class="text-xs text-gray-500">
                                {contributionsOffset + 1}–{Math.min(contributionsOffset + contributionsLimit, contributionsTotal)} of {contributionsTotal}
                            </span>
                            <div class="flex gap-2">
                                <button
                                    disabled={contributionsOffset === 0}
                                    onclick={() => { contributionsOffset = Math.max(0, contributionsOffset - contributionsLimit); loadContributions(); }}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Previous</button>
                                <button
                                    disabled={contributionsOffset + contributionsLimit >= contributionsTotal}
                                    onclick={() => { contributionsOffset += contributionsLimit; loadContributions(); }}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Next</button>
                            </div>
                        </div>
                    {:else}
                        <p class="text-gray-500 text-sm">No contributions found.</p>
                    {/if}
                </div>
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
