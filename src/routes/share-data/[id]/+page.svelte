<script lang="ts">
    import { onMount, tick } from "svelte";
    import { goto } from "$app/navigation";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type ContributionDetail = {
        id: string;
        provider: string;
        distanceKm: number | null;
        durationMinutes: number | null;
        startTime: string;
        endTime: string | null;
        privacyLevel: string | null;
        track: number[][];
    };

    type PrivacyOption = { value: string | null; label: string };
    const privacyOptions: PrivacyOption[] = [
        { value: null, label: "Account" },
        { value: "open", label: "Open" },
        { value: "partners", label: "Partners only" },
        { value: "anonymised", label: "Anonymised" }
    ];

    let { data } = $props();
    let contribution: ContributionDetail | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let privacySaving = $state(false);
    let deleting = $state(false);
    let mapContainer: HTMLDivElement;

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;

        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;

        const res = await fetch(
            `${appManager.settings.api_url}/api/contributions/${data.id}`,
            { headers: { Authorization: "Bearer " + user.access_token } }
        );

        if (!res.ok) {
            if (res.status === 404) {
                error = "Contribution not found.";
            } else {
                error = `Failed to load contribution: ${res.statusText}`;
            }
            loading = false;
            return;
        }

        contribution = await res.json();
        loading = false;

        // Wait for the DOM to render the map container before initializing
        await tick();

        if (contribution && contribution.track.length >= 2) {
            initMap(contribution.track);
        }
    });

    function initMap(track: number[][]) {
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: track
            }
        };

        // Compute bounds from coordinates
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        for (const coord of track) {
            if (coord[0] < minLng) minLng = coord[0];
            if (coord[0] > maxLng) maxLng = coord[0];
            if (coord[1] < minLat) minLat = coord[1];
            if (coord[1] > maxLat) maxLat = coord[1];
        }

        const map = new maplibregl.Map({
            container: mapContainer,
            style: "https://api.maptiler.com/maps/67ea3b5b-d4ac-48f3-ad92-6574c2dc9734/style.json?key=OZUCIh4RNx38vXF8gF4H",
            bounds: [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]],
            fitBoundsOptions: { padding: 50 }
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", () => {
            map.addSource("route", {
                type: "geojson",
                data: geojson
            });

            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": "#ef4823",
                    "line-width": 4
                }
            });

            // Start marker
            new maplibregl.Marker({ color: "#22c55e" })
                .setLngLat(track[0] as [number, number])
                .addTo(map);

            // End marker
            new maplibregl.Marker({ color: "#ef4444" })
                .setLngLat(track[track.length - 1] as [number, number])
                .addTo(map);
        });
    }

    async function saveActivityPrivacy(level: string | null) {
        if (!contribution) return;
        privacySaving = true;
        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/contributions/${contribution.id}/privacy`,
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
                contribution.privacyLevel = data.privacyLevel ?? null;
            }
        } finally {
            privacySaving = false;
        }
    }

    function formatDuration(minutes: number | null): string {
        if (minutes === null) return "\u2014";
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return `${h}h ${m}m`;
    }

    function formatDistance(km: number | null): string {
        if (km === null) return "\u2014";
        return `${km.toFixed(1)} km`;
    }

    async function deleteContribution() {
        if (!contribution) return;
        if (!confirm("Are you sure you want to delete this contribution? This cannot be undone.")) return;
        deleting = true;
        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;
            const res = await fetch(
                `${appManager.settings.api_url}/api/contributions/${contribution.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: "Bearer " + user.access_token }
                }
            );
            if (res.ok) {
                goto("/share-data");
            }
        } finally {
            deleting = false;
        }
    }

    function formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    function downloadGpx() {
        if (!contribution || contribution.track.length < 2) return;
        const trkpts = contribution.track
            .map(c => `      <trkpt lat="${c[1]}" lon="${c[0]}">${c[2] !== undefined ? `<ele>${c[2]}</ele>` : ""}</trkpt>`)
            .join("\n");
        const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BikeDataProject">
  <trk>
    <name>Contribution ${contribution.id}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
        const blob = new Blob([gpx], { type: "application/gpx+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contribution-${contribution.id}.gpx`;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-8 md:mt-16 px-6 md:px-[8vw] mb-16">
            <a href="/share-data" class="text-sm text-gray-500 hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back to Share Data
            </a>

            {#if loading}
                <p class="text-gray-500">Loading contribution...</p>
            {:else if error}
                <p class="text-red-600">{error}</p>
            {:else if contribution}
                <h2 class="mb-1">Contribution</h2>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                        <p class="text-sm font-semibold text-gray-800">{formatDate(contribution.startTime)}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</p>
                        <p class="text-sm font-semibold text-gray-800">{formatDistance(contribution.distanceKm)}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                        <p class="text-sm font-semibold text-gray-800">{formatDuration(contribution.durationMinutes)}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Provider</p>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{contribution.provider}</span>
                    </div>
                </div>

                <div class="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="text-sm text-gray-600">Data sharing level:</span>
                        <div class="inline-flex">
                            {#each privacyOptions as opt, i}
                                <button
                                    disabled={privacySaving}
                                    onclick={() => saveActivityPrivacy(opt.value)}
                                    class="text-sm px-3 py-1.5 border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {i === 0 ? 'rounded-l-lg' : ''} {i === privacyOptions.length - 1 ? 'rounded-r-lg' : ''} {i > 0 ? '-ml-px' : ''} {contribution.privacyLevel === opt.value ? 'border-primary bg-primary text-white font-semibold z-10 relative' : 'border-gray-200 bg-white text-gray-600 hover:border-primary'}"
                                >{opt.label}</button>
                            {/each}
                        </div>
                    </div>
                </div>

                {#if contribution.track.length >= 2}
                    <div
                        bind:this={mapContainer}
                        class="w-full h-[500px] rounded-xl border border-gray-200 overflow-hidden"
                    ></div>
                {:else}
                    <p class="text-gray-500 text-sm">No GPS track available for this contribution.</p>
                {/if}

                <div class="mt-6 flex justify-end gap-3">
                    <button
                        onclick={downloadGpx}
                        class="text-sm px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download GPX
                    </button>
                    <button
                        disabled={deleting}
                        onclick={deleteContribution}
                        class="text-sm px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        {deleting ? "Deleting..." : "Delete contribution"}
                    </button>
                </div>
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
