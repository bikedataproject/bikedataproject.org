<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type ProviderStat = { provider: string; tracks: number; distanceKm: number };
    type Contribution = {
        id: string;
        provider: string;
        distanceKm: number | null;
        durationMinutes: number | null;
        startTime: string;
        privacyLevel: string | null;
        mapMatchStatus: string;
    };

    type UserDetail = {
        userId: string;
        username: string | null;
        email: string | null;
        privacyLevel: string | null;
        stats: {
            totalTracks: number;
            totalDistanceKm: number;
            byProvider: ProviderStat[];
        };
        contributions: {
            items: Contribution[];
            total: number;
        };
    };

    let { data } = $props();
    let user: UserDetail | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let offset = $state(0);
    const limit = 25;

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;
        await loadUser();
    });

    async function loadUser() {
        loading = true;
        error = null;

        const auth = await appManager.authenticator.getUserIdOrRedirect();
        if (!auth) return;

        const res = await fetch(
            `${appManager.settings.api_url}/api/admin/users/${data.userId}?offset=${offset}&limit=${limit}`,
            { headers: { Authorization: "Bearer " + auth.access_token } }
        );

        if (res.status === 403) {
            error = "Access denied. You do not have admin permissions.";
            loading = false;
            return;
        }

        if (!res.ok) {
            error = res.status === 404
                ? "User not found."
                : `Failed to load user: ${res.statusText}`;
            loading = false;
            return;
        }

        user = await res.json();
        loading = false;
    }

    async function nextPage() {
        offset += limit;
        await loadUser();
    }

    async function prevPage() {
        offset = Math.max(0, offset - limit);
        await loadUser();
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
            <a href="/admin/users" class="text-sm text-gray-500 hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back to Users
            </a>

            {#if loading}
                <p class="text-gray-500">Loading user...</p>
            {:else if error}
                <p class="text-red-600">{error}</p>
            {:else if user}
                <h2 class="mb-1">{user.username ?? user.email ?? shortId(user.userId)}</h2>

                <div class="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Username</p>
                        <p class="text-sm font-semibold text-gray-800">{user.username ?? "\u2014"}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <p class="text-sm font-semibold text-gray-800">{user.email ?? "\u2014"}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Privacy</p>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{user.privacyLevel ?? "not set"}</span>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Contributions</p>
                        <p class="text-sm font-semibold text-gray-800">{user.stats.totalTracks}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Distance</p>
                        <p class="text-sm font-semibold text-gray-800">{formatDistance(user.stats.totalDistanceKm)}</p>
                    </div>
                </div>

                {#if user.stats.byProvider.length > 0}
                    <div class="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div class="flex flex-wrap gap-3">
                            {#each user.stats.byProvider as p}
                                <span class="text-sm px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                    {p.provider}: {p.tracks} track{p.tracks > 1 ? 's' : ''} ({Math.round(p.distanceKm)} km)
                                </span>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if user.contributions.total > 0}
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Contributions</h3>

                    <div class="overflow-x-auto rounded-xl border border-gray-200">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                                <tr>
                                    <th class="px-4 py-3">Date</th>
                                    <th class="px-4 py-3">Distance</th>
                                    <th class="px-4 py-3">Duration</th>
                                    <th class="px-4 py-3">Provider</th>
                                    <th class="px-4 py-3">Match</th>
                                    <th class="px-4 py-3">Privacy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each user.contributions.items as c (c.id)}
                                    <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onclick={() => goto(`/admin/contribution/${c.id}`)}>
                                        <td class="px-4 py-3 text-gray-800 whitespace-nowrap">{formatDate(c.startTime)}</td>
                                        <td class="px-4 py-3 text-gray-700">{formatDistance(c.distanceKm)}</td>
                                        <td class="px-4 py-3 text-gray-700">{formatDuration(c.durationMinutes)}</td>
                                        <td class="px-4 py-3">
                                            <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c.provider}</span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <span class="text-xs px-2 py-0.5 rounded-full {c.mapMatchStatus === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : c.mapMatchStatus === 'error' ? 'bg-red-50 border-red-200 text-red-700' : c.mapMatchStatus === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'} border">{c.mapMatchStatus}</span>
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
                            {offset + 1}–{Math.min(offset + limit, user.contributions.total)} of {user.contributions.total}
                        </span>
                        <div class="flex gap-2">
                            <button
                                disabled={offset === 0}
                                onclick={prevPage}
                                class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >Previous</button>
                            <button
                                disabled={offset + limit >= user.contributions.total}
                                onclick={nextPage}
                                class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >Next</button>
                        </div>
                    </div>
                {:else}
                    <p class="text-gray-500 text-sm">No contributions from this user.</p>
                {/if}
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
