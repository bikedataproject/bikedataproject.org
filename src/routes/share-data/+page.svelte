<script lang="ts">
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    let gpxFiles: FileList | null = $state(null);
    let dragging = $state(false);

    function handleDrop(e: DragEvent) {
        dragging = false;
        gpxFiles = e.dataTransfer?.files ?? null;
    }

    async function linkStrava() {
        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (user === null) return;

        const response = await fetch("https://www.bikedataproject.org/strava/login", {
            headers: {
                Authorization: "Bearer " + user.access_token,
            },
        });

        if (response.redirected) {
            window.location.href = response.url;
        } else if (response.ok) {
            const url = await response.text();
            if (url) window.location.href = url;
        }
    }
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-16 md:mt-[200px] px-6 md:px-[8vw] mb-16 md:mb-[200px]">
            <p class="background-big-letter hidden md:block">Share</p>
            <h2>Share your data</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <!-- Strava -->
                <div class="border border-gray-200 rounded-xl p-8 flex flex-col gap-6">
                    <div class="flex items-center gap-4">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="#FC4C02"/>
                            <path d="M22.5 28l-3.5-6.8h-3.5L22.5 36l7-14.8H26L22.5 28z" fill="white"/>
                            <path d="M16.5 14L13 21.2h3.5l3-6.2-3-6.8L13 21.2" fill="white" opacity="0.6"/>
                            <path d="M16.5 8.2l-3.5 13h3.5L19.5 14l-3-5.8z" fill="white"/>
                        </svg>
                        <h3 class="text-xl font-bold text-gray-800 m-0">Strava</h3>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Connect your Strava account to automatically contribute your cycling activities to the Bike Data Project. Your past rides will also be synchronized.
                    </p>
                    <button
                        onclick={linkStrava}
                        class="w-full py-3 px-4 bg-[#FC4C02] text-white font-semibold rounded-lg hover:bg-[#e04402] transition-colors cursor-pointer">
                        Link your Strava account
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
                            <span class="text-xs font-semibold text-primary uppercase tracking-wide">Coming soon</span>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm flex-1">
                        Connect your Garmin account to automatically sync your cycling activities with the Bike Data Project. Garmin support is on its way!
                    </p>
                    <button disabled class="w-full py-3 px-4 bg-[#006DB6] text-white font-semibold rounded-lg opacity-40 cursor-not-allowed">
                        Link your Garmin account
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
                        Upload GPX files directly from your device. You can select multiple files at once, including exports of your past rides.
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
                                <span class="text-xs text-gray-400">.gpx files only</span>
                            {/if}
                        </div>
                        <input
                            type="file"
                            accept=".gpx"
                            multiple
                            class="hidden"
                            bind:files={gpxFiles}
                        />
                    </label>

                    <button
                        disabled={!gpxFiles || gpxFiles.length === 0}
                        class="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Upload {gpxFiles && gpxFiles.length > 0 ? `${gpxFiles.length} file${gpxFiles.length > 1 ? 's' : ''}` : 'files'}
                    </button>
                </div>

            </div>
        </section>
    </div>
    <Footer />
</PrivatePage>
