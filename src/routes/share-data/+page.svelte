<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type ProviderStats = { provider: string; tracks: number; distanceKm: number };
    type StatsResult = { totalTracks: number; totalDistanceKm: number; byProvider: ProviderStats[] };
    type Contribution = { id: string; provider: string; distanceKm: number | null; durationMinutes: number | null; startTime: string; privacyLevel: string | null };
    type ContributionsResponse = { items: Contribution[]; total: number };

    type PrivacyOption = { value: string; label: string; description: string };
    const privacyOptions: PrivacyOption[] = [
        { value: "open", label: "Open", description: "Your raw tracks are published as open data, freely available to anyone. Your data is also shared with partners and included in anonymised datasets." },
        { value: "partners", label: "Partners only", description: "Your data is shared privately with our partners (e.g. city planners, mobility researchers) and included in anonymised datasets, but is not publicly available." },
        { value: "anonymised", label: "Anonymised", description: "Your data is only used in aggregated, anonymised datasets where individual tracks cannot be identified." }
    ];

    let stats: StatsResult | null = $state(null);
    let privacyLevel: string | null | undefined = $state(undefined); // undefined = loading, null = not set
    let privacySaving = $state(false);
    let contributions: Contribution[] = $state([]);
    let contributionsTotal = $state(0);
    let contributionsLoading = $state(false);
    let contributionsOffset = $state(0);
    const contributionsLimit = 25;
    let gpxFiles: FileList | null = $state(null);
    let isAdmin = $state(false);
    let dragging = $state(false);
    let uploading = $state(false);
    let uploadResult: { imported: number; duplicates: number; failed: number; errors: string[] } | null = $state(null);

    function handleDrop(e: DragEvent) {
        dragging = false;
        gpxFiles = e.dataTransfer?.files ?? null;
        uploadResult = null;
    }

    onMount(async () => {
        // Don't independently trigger a redirect here — PrivatePage handles that.
        // Calling getUserIdOrRedirect() concurrently with PrivatePage's auth check
        // causes two competing signinRedirect() calls that can interfere.
        if (!(await appManager.authenticator.isSignedIn())) return;

        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;
        const [statsRes, settingsRes] = await Promise.all([
            fetch(`${appManager.settings.api_url}/api/stats`, {
                headers: { Authorization: "Bearer " + user.access_token }
            }),
            fetch(`${appManager.settings.api_url}/api/settings`, {
                headers: { Authorization: "Bearer " + user.access_token }
            })
        ]);
        // Check admin access (non-blocking).
        fetch(`${appManager.settings.api_url}/api/admin/users?limit=1`, {
            headers: { Authorization: "Bearer " + user.access_token }
        }).then(r => { if (r.ok) isAdmin = true; });

        if (statsRes.ok) stats = await statsRes.json();
        if (settingsRes.ok) {
            const data = await settingsRes.json();
            privacyLevel = data.privacyLevel ?? null;
        } else {
            privacyLevel = null;
        }

        await loadContributions();
    });

    async function loadContributions() {
        contributionsLoading = true;
        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/contributions?offset=${contributionsOffset}&limit=${contributionsLimit}`,
                { headers: { Authorization: "Bearer " + user.access_token } }
            );
            if (res.ok) {
                const data: ContributionsResponse = await res.json();
                contributions = data.items;
                contributionsTotal = data.total;
            }
        } finally {
            contributionsLoading = false;
        }
    }

    async function contributionsNextPage() {
        contributionsOffset += contributionsLimit;
        await loadContributions();
    }

    async function contributionsPrevPage() {
        contributionsOffset = Math.max(0, contributionsOffset - contributionsLimit);
        await loadContributions();
    }

    async function deleteContribution(c: Contribution) {
        if (!confirm("Are you sure you want to delete this contribution? This cannot be undone.")) return;
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;
        const res = await fetch(
            `${appManager.settings.api_url}/api/contributions/${c.id}`,
            {
                method: "DELETE",
                headers: { Authorization: "Bearer " + user.access_token }
            }
        );
        if (res.ok) {
            contributions = contributions.filter(x => x.id !== c.id);
            contributionsTotal--;
        }
    }

    async function saveActivityPrivacy(c: Contribution, level: string | null) {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;
        const res = await fetch(
            `${appManager.settings.api_url}/api/contributions/${c.id}/privacy`,
            {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + user.access_token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ privacyLevel: level })
            }
        );
        if (res.ok) {
            const data = await res.json();
            c.privacyLevel = data.privacyLevel ?? null;
        }
    }

    function formatDuration(minutes: number | null): string {
        if (minutes === null) return "—";
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return `${h}h ${m}m`;
    }

    function formatDistance(km: number | null): string {
        if (km === null) return "—";
        return `${km.toFixed(1)} km`;
    }

    function formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    async function savePrivacyLevel(level: string) {
        privacySaving = true;
        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;
            const res = await fetch(`${appManager.settings.api_url}/api/settings`, {
                method: "PUT",
                headers: {
                    Authorization: "Bearer " + user.access_token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ privacyLevel: level })
            });
            if (res.ok) {
                const data = await res.json();
                privacyLevel = data.privacyLevel;
            }
        } finally {
            privacySaving = false;
        }
    }

    async function linkPolar() {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;

        const response = await fetch(`${appManager.settings.api_url}/polar/login`, {
            headers: {
                Authorization: "Bearer " + user.access_token,
            },
        });

        if (response.ok) {
            const url = await response.text();
            if (url) window.location.href = url;
        }
    }

    async function linkStrava() {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (user === null) return;

        const response = await fetch(`${appManager.settings.api_url}/strava/login`, {
            headers: {
                Authorization: "Bearer " + user.access_token,
            },
        });

        if (response.ok) {
            const url = await response.text();
            if (url) window.location.href = url;
        }
    }

    async function uploadFiles() {
        if (!gpxFiles || gpxFiles.length === 0) return;

        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (user === null) return;

        uploading = true;
        uploadResult = null;

        try {
            const formData = new FormData();
            for (const file of gpxFiles) {
                formData.append("files", file);
            }

            const response = await fetch(`${appManager.settings.api_url}/manual/upload`, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + user.access_token,
                },
                body: formData,
            });

            if (response.ok) {
                uploadResult = await response.json();
                gpxFiles = null;
            } else {
                uploadResult = { imported: 0, duplicates: 0, failed: gpxFiles.length, errors: [`Upload failed: ${response.statusText}`] };
            }
        } finally {
            uploading = false;
        }
    }
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-8 md:mt-16 px-6 md:px-[8vw] mb-16 md:mb-[200px]">
            <p class="background-big-letter hidden md:block">Share</p>
            <div class="flex items-center justify-between">
                <h2 class="m-0">Share your data</h2>
                {#if isAdmin}
                    <a href="/admin" class="text-sm text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Admin
                    </a>
                {/if}
            </div>

            {#if privacyLevel === null}
                <div class="mb-8 p-6 rounded-xl border-2 border-primary bg-orange-50">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Choose your data sharing level</h3>
                    <p class="text-sm text-gray-600 mb-4">
                        Before you can share data, please choose how your cycling data may be used.
                        You can change this at any time. See our <a href="/privacy" class="text-primary underline hover:text-primary-hover">privacy policy</a> for details.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {#each privacyOptions as opt}
                            <button
                                disabled={privacySaving}
                                onclick={() => savePrivacyLevel(opt.value)}
                                class="p-4 rounded-lg border-2 border-gray-200 bg-white text-left hover:border-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <p class="font-semibold text-gray-800 mb-1">{opt.label}</p>
                                <p class="text-xs text-gray-500">{opt.description}</p>
                            </button>
                        {/each}
                    </div>
                </div>
            {:else if privacyLevel !== undefined}
                <div class="mb-8 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="text-sm text-gray-600">Data sharing level:</span>
                        <div class="inline-flex">
                            {#each privacyOptions as opt, i}
                                <button
                                    disabled={privacySaving}
                                    onclick={() => savePrivacyLevel(opt.value)}
                                    class="text-sm px-3 py-1.5 border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {i === 0 ? 'rounded-l-lg' : ''} {i === privacyOptions.length - 1 ? 'rounded-r-lg' : ''} {i > 0 ? '-ml-px' : ''} {privacyLevel === opt.value ? 'border-primary bg-primary text-white font-semibold z-10 relative' : 'border-gray-200 bg-white text-gray-600 hover:border-primary'}"
                                >{opt.label}</button>
                            {/each}
                        </div>
                        <a href="/privacy" class="text-xs text-gray-400 hover:text-primary ml-auto">Privacy policy</a>
                    </div>
                </div>

                {#if stats !== null}
                    <div class="mb-8 p-6 rounded-xl border border-gray-200 bg-gray-50">
                        {#if stats.totalTracks > 0}
                            <p class="text-lg font-semibold text-gray-800 mb-3">
                                Thank you for your {stats.totalTracks} contribution{stats.totalTracks > 1 ? 's' : ''} totalling {Math.round(stats.totalDistanceKm)} km!
                            </p>
                            <div class="flex flex-wrap gap-3">
                                {#each stats.byProvider as p}
                                    <span class="text-sm px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                                        {p.provider}: {p.tracks} track{p.tracks > 1 ? 's' : ''} ({Math.round(p.distanceKm)} km)
                                    </span>
                                {/each}
                            </div>
                        {:else}
                            <p class="text-gray-600">No contributions yet — use one of the options below to get started.</p>
                        {/if}
                    </div>
                {/if}

            {#if contributionsTotal > 0 || contributionsLoading}
                <div class="mb-8">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Your contributions</h3>

                    {#if contributionsLoading}
                        <p class="text-gray-500 text-sm">Loading contributions...</p>
                    {:else}
                        <div class="overflow-x-auto rounded-xl border border-gray-200">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                                    <tr>
                                        <th class="px-4 py-3">Date</th>
                                        <th class="px-4 py-3">Distance</th>
                                        <th class="px-4 py-3">Duration</th>
                                        <th class="px-4 py-3">Provider</th>
                                        <th class="px-4 py-3">Sharing</th>
                                        <th class="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each contributions as c (c.id)}
                                        <tr class="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td class="px-4 py-3 text-gray-800 whitespace-nowrap cursor-pointer" onclick={() => goto(`/share-data/${c.id}`)}>{formatDate(c.startTime)}</td>
                                            <td class="px-4 py-3 text-gray-700 cursor-pointer" onclick={() => goto(`/share-data/${c.id}`)}>{formatDistance(c.distanceKm)}</td>
                                            <td class="px-4 py-3 text-gray-700 cursor-pointer" onclick={() => goto(`/share-data/${c.id}`)}>{formatDuration(c.durationMinutes)}</td>
                                            <td class="px-4 py-3 cursor-pointer" onclick={() => goto(`/share-data/${c.id}`)}>
                                                <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c.provider}</span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="inline-flex">
                                                    {#each [{ value: null, label: "Account" }, { value: "open", label: "Open" }, { value: "partners", label: "Partners" }, { value: "anonymised", label: "Anonymised" }] as opt, i}
                                                        <button
                                                            onclick={(e) => { e.stopPropagation(); saveActivityPrivacy(c, opt.value); }}
                                                            class="text-xs px-2 py-0.5 border transition-colors cursor-pointer {i === 0 ? 'rounded-l-lg' : ''} {i === 3 ? 'rounded-r-lg' : ''} {i > 0 ? '-ml-px' : ''} {c.privacyLevel === opt.value ? 'border-primary bg-primary text-white font-semibold z-10 relative' : 'border-gray-200 bg-white text-gray-500 hover:border-primary'}"
                                                        >{opt.label}</button>
                                                    {/each}
                                                </div>
                                            </td>
                                            <td class="px-4 py-3">
                                                <button
                                                    onclick={(e) => { e.stopPropagation(); deleteContribution(c); }}
                                                    class="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Delete contribution"
                                                >
                                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
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
                                    onclick={contributionsPrevPage}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Previous</button>
                                <button
                                    disabled={contributionsOffset + contributionsLimit >= contributionsTotal}
                                    onclick={contributionsNextPage}
                                    class="px-3 py-1 text-sm rounded border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >Next</button>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}

            <h3 class="text-lg font-bold text-gray-800 mb-4">Contribution Options</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- GPX Upload -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 m-0">Upload GPX</h3>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Upload GPX files directly from your device. You can also upload a ZIP archive containing multiple GPX files for bulk imports.
                    </p>

                    <label
                        class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors {dragging ? 'border-primary bg-orange-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}"
                        ondragover={(e) => { e.preventDefault(); dragging = true; }}
                        ondragleave={() => dragging = false}
                        ondrop={(e) => { e.preventDefault(); handleDrop(e); }}
                    >
                        <div class="flex flex-col items-center justify-center gap-1 text-center px-4">
                            {#if gpxFiles && gpxFiles.length > 0}
                                <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span class="text-sm font-semibold text-primary">{gpxFiles.length} file{gpxFiles.length > 1 ? 's' : ''} selected</span>
                            {:else}
                                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span class="text-sm font-semibold text-gray-600">Drop files here or click to browse</span>
                                <span class="text-xs text-gray-400">.gpx or .zip files</span>
                            {/if}
                        </div>
                        <input
                            type="file"
                            accept=".gpx,.zip"
                            multiple
                            class="hidden"
                            bind:files={gpxFiles}
                            onchange={() => { uploadResult = null; }}
                        />
                    </label>

                    {#if uploadResult}
                        <div class="text-sm rounded-lg p-3 {uploadResult.failed > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}">
                            <p class="font-semibold">Upload complete</p>
                            <p>{uploadResult.imported} imported, {uploadResult.duplicates} duplicates, {uploadResult.failed} failed</p>
                            {#if uploadResult.errors.length > 0}
                                <ul class="mt-1 list-disc list-inside text-xs">
                                    {#each uploadResult.errors as error}
                                        <li>{error}</li>
                                    {/each}
                                </ul>
                            {/if}
                        </div>
                    {/if}

                    <button
                        disabled={uploading || !gpxFiles || gpxFiles.length === 0}
                        onclick={uploadFiles}
                        class="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {#if uploading}
                            Uploading...
                        {:else}
                            Upload {gpxFiles && gpxFiles.length > 0 ? `${gpxFiles.length} file${gpxFiles.length > 1 ? 's' : ''}` : 'files'}
                        {/if}
                    </button>
                </div>

                <!-- Mobile App -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 m-0">Mobile App</h3>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Track your bike rides with GPS using our Android app. Rides are stored locally and uploaded automatically to the Bike Data Project.
                    </p>
                    <a
                        href="https://github.com/bikedataproject/mobile-app/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full py-3 px-4 bg-dark text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors text-center"
                    >
                        Download APK (Android)
                    </a>
                </div>

                <!-- Strava -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6 opacity-60">
                    <div class="flex items-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#FC4C02"/>
                            <path d="M22.5 28l-3.5-6.8h-3.5L22.5 36l7-14.8H26L22.5 28z" fill="white"/>
                            <path d="M16.5 14L13 21.2h3.5l3-6.2-3-6.8L13 21.2" fill="white" opacity="0.6"/>
                            <path d="M16.5 8.2l-3.5 13h3.5L19.5 14l-3-5.8z" fill="white"/>
                        </svg>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 m-0">Strava</h3>
                            <span class="text-xs font-semibold text-red-500 uppercase tracking-wide">Temporarily unavailable</span>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Strava is currently not giving us access and limits our integration to a single user. If you know of a workaround, please <a href="mailto:info@bikedataproject.org" class="text-[#FC4C02] underline">let us know</a>!
                    </p>
                    <button disabled class="w-full py-3 px-4 bg-[#FC4C02] text-white font-semibold rounded-lg opacity-40 cursor-not-allowed">
                        Currently unavailable
                    </button>
                </div>

                <!-- Polar -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6 opacity-60">
                    <div class="flex items-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#DC0019"/>
                            <text x="20" y="27" text-anchor="middle" font-size="18" font-weight="bold" font-family="Arial, sans-serif" fill="white">P</text>
                        </svg>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 m-0">Polar</h3>
                            <span class="text-xs font-semibold text-red-500 uppercase tracking-wide">Temporarily unavailable</span>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Connect your Polar account to automatically share your cycling activities via the Polar AccessLink API.
                    </p>
                    <p class="text-xs text-gray-400">
                        Polar will ask permission to access all health data — this is the only scope they offer. We only read your cycling activities.
                    </p>
                    <button disabled class="w-full py-3 px-4 bg-[#DC0019] text-white font-semibold rounded-lg opacity-40 cursor-not-allowed">
                        Currently unavailable
                    </button>
                </div>

                <!-- Garmin -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6 opacity-60">
                    <div class="flex items-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#006DB6"/>
                            <text x="20" y="27" text-anchor="middle" font-size="18" font-weight="bold" font-family="Arial, sans-serif" fill="white">G</text>
                        </svg>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 m-0">Garmin</h3>
                            <span class="text-xs font-semibold text-blue-500 uppercase tracking-wide">API access pending</span>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        We have applied for access to the official Garmin Health API but have not yet been accepted. We'll enable this integration as soon as we get access.
                    </p>
                    <button disabled class="w-full py-3 px-4 bg-[#006DB6] text-white font-semibold rounded-lg opacity-40 cursor-not-allowed">
                        Coming soon
                    </button>
                </div>

            </div>

            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
