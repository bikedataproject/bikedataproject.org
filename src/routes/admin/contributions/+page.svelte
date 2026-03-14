<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type AdminContribution = { id: string; userId: string; username: string | null; provider: string; distanceKm: number | null; durationMinutes: number | null; startTime: string; privacyLevel: string | null; mapMatchStatus: string };

    let accessDenied = $state(false);
    let contributions: AdminContribution[] = $state([]);
    let total = $state(0);
    let loading = $state(false);
    const limit = 25;

    let offset = $derived(parseInt($page.url.searchParams.get("offset") ?? "0", 10) || 0);
    let initialized = $state(false);

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;
        await loadContributions();
        initialized = true;
    });

    $effect(() => {
        // Re-fetch when offset changes via URL (skip initial mount)
        offset;
        if (initialized) loadContributions();
    });

    async function getToken(): Promise<string | null> {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        return user?.access_token ?? null;
    }

    async function loadContributions() {
        loading = true;
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/admin/contributions?offset=${offset}&limit=${limit}`,
                { headers: { Authorization: "Bearer " + token } }
            );
            if (res.status === 403) {
                accessDenied = true;
                return;
            }
            if (res.ok) {
                const data = await res.json();
                contributions = data.items;
                total = data.total;
            }
        } finally {
            loading = false;
        }
    }

    function setOffset(newOffset: number) {
        const url = new URL($page.url);
        if (newOffset === 0) {
            url.searchParams.delete("offset");
        } else {
            url.searchParams.set("offset", String(newOffset));
        }
        goto(url.toString(), { replaceState: false, noScroll: true });
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
            <div class="flex items-center gap-3 mb-4">
                <a href="/admin" class="text-sm text-gray-500 hover:text-gray-800 transition-colors">&larr; Admin</a>
            </div>
            <h2 class="mb-4">Contributions ({total})</h2>

            {#if accessDenied}
                <div class="p-6 rounded-xl border-2 border-red-200 bg-red-50">
                    <p class="text-red-700 font-semibold">Access denied. You do not have admin permissions.</p>
                </div>
            {:else if loading}
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
                                <th class="px-4 py-3">Match</th>
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
                        {offset + 1}–{Math.min(offset + limit, total)} of {total}
                    </span>
                    <div class="flex gap-2">
                        <button
                            disabled={offset === 0}
                            onclick={() => setOffset(Math.max(0, offset - limit))}
                            class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >Previous</button>
                        <button
                            disabled={offset + limit >= total}
                            onclick={() => setOffset(offset + limit)}
                            class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >Next</button>
                    </div>
                </div>
            {:else}
                <p class="text-gray-500 text-sm">No contributions found.</p>
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
