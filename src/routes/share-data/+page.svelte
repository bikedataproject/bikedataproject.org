<script lang="ts">
    import { onMount } from "svelte";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type ProviderStats = { provider: string; tracks: number; distanceKm: number };
    type StatsResult = { totalTracks: number; totalDistanceKm: number; byProvider: ProviderStats[] };

    let stats: StatsResult | null = $state(null);
    let gpxFiles: FileList | null = $state(null);
    let dragging = $state(false);
    let uploading = $state(false);
    let uploadResult: { imported: number; duplicates: number; failed: number; errors: string[] } | null = $state(null);

    function handleDrop(e: DragEvent) {
        dragging = false;
        gpxFiles = e.dataTransfer?.files ?? null;
        uploadResult = null;
    }

    onMount(async () => {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;
        const res = await fetch(`${appManager.settings.public_url}/api/stats`, {
            headers: { Authorization: "Bearer " + user.access_token }
        });
        if (res.ok) stats = await res.json();
    });

    async function linkPolar() {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;

        const response = await fetch(`${appManager.settings.public_url}/polar/login`, {
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

        const response = await fetch(`${appManager.settings.public_url}/strava/login`, {
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

            const response = await fetch(`${appManager.settings.public_url}/manual/upload`, {
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
        <section class="relative mt-16 md:mt-[200px] px-6 md:px-[8vw] mb-16 md:mb-[200px]">
            <p class="background-big-letter hidden md:block">Share</p>
            <h2>Share your data</h2>

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

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

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
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                    <div class="flex items-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#DC0019"/>
                            <text x="20" y="27" text-anchor="middle" font-size="18" font-weight="bold" font-family="Arial, sans-serif" fill="white">P</text>
                        </svg>
                        <h3 class="text-xl font-bold text-gray-800 m-0">Polar</h3>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Connect your Polar account to automatically share your cycling activities via the Polar AccessLink API.
                    </p>
                    <button
                        onclick={linkPolar}
                        class="w-full py-3 px-4 bg-[#DC0019] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Connect Polar
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

            </div>
        </section>
    </div>
    <Footer />
</PrivatePage>
