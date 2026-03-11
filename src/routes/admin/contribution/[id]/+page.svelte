<script lang="ts">
    import { onMount, tick } from "svelte";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    type MapMatchSegment = {
        edgeGlobalId: string;
        forward: boolean;
        attributes: Record<string, string> | null;
        geometry: number[][];
    };

    type MapMatchData = {
        status: string;
        createdAt: string;
        completedAt: string | null;
        attempts: number;
        segments: MapMatchSegment[];
    };

    type ContributionDetail = {
        id: string;
        userId: string;
        username: string | null;
        email: string | null;
        provider: string;
        distanceKm: number | null;
        durationMinutes: number | null;
        startTime: string;
        endTime: string | null;
        privacyLevel: string | null;
        track: number[][];
        mapMatch: MapMatchData | null;
    };

    let { data } = $props();
    let contribution: ContributionDetail | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);
    let mapContainer: HTMLDivElement;

    onMount(async () => {
        if (!(await appManager.authenticator.isSignedIn())) return;

        const user = await appManager.authenticator.getUserIdOrRedirect();
        if (!user) return;

        const res = await fetch(
            `${appManager.settings.api_url}/api/admin/contributions/${data.id}`,
            { headers: { Authorization: "Bearer " + user.access_token } }
        );

        if (res.status === 403) {
            error = "Access denied. You do not have admin permissions.";
            loading = false;
            return;
        }

        if (!res.ok) {
            error = res.status === 404
                ? "Contribution not found."
                : `Failed to load contribution: ${res.statusText}`;
            loading = false;
            return;
        }

        contribution = await res.json();
        loading = false;

        await tick();

        if (contribution && contribution.track.length >= 2) {
            initMap(contribution.track, contribution.mapMatch);
        }
    });

    function initMap(track: number[][], mapMatch: MapMatchData | null) {
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
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: { type: "LineString", coordinates: track }
                }
            });

            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#ef4823", "line-width": 4, "line-opacity": 0.5 }
            });

            // Add matched route segments
            if (mapMatch && mapMatch.segments.length > 0) {
                const features = mapMatch.segments.map((seg, i) => ({
                    type: "Feature" as const,
                    properties: {
                        index: i,
                        forward: seg.forward,
                        edgeGlobalId: seg.edgeGlobalId,
                        ...seg.attributes
                    },
                    geometry: {
                        type: "LineString" as const,
                        coordinates: seg.geometry
                    }
                }));

                map.addSource("matched-route", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features }
                });

                map.addLayer({
                    id: "matched-route-line",
                    type: "line",
                    source: "matched-route",
                    layout: { "line-join": "round", "line-cap": "round" },
                    paint: { "line-color": "#2563eb", "line-width": 4 }
                });
            }

            new maplibregl.Marker({ color: "#22c55e" })
                .setLngLat(track[0] as [number, number])
                .addTo(map);

            new maplibregl.Marker({ color: "#ef4444" })
                .setLngLat(track[track.length - 1] as [number, number])
                .addTo(map);
        });
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

    function formatDate(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
</script>

<PrivatePage>
    <NavBar />
    <div class="pt-16">
        <section class="relative mt-8 md:mt-16 px-6 md:px-[8vw] mb-16">
            <a href="/admin" class="text-sm text-gray-500 hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back to Admin
            </a>

            {#if loading}
                <p class="text-gray-500">Loading contribution...</p>
            {:else if error}
                <p class="text-red-600">{error}</p>
            {:else if contribution}
                <h2 class="mb-1">Contribution</h2>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">User</p>
                        <p class="text-sm font-semibold text-gray-800" title={contribution.userId}>{contribution.username ?? contribution.email ?? contribution.userId.substring(0, 8) + "\u2026"}</p>
                    </div>
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
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Map Match</p>
                        {#if contribution.mapMatch}
                            <span class="text-xs px-2 py-0.5 rounded-full border {contribution.mapMatch.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : contribution.mapMatch.status === 'error' ? 'bg-red-50 border-red-200 text-red-700' : contribution.mapMatch.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}">{contribution.mapMatch.status}</span>
                        {:else}
                            <span class="text-xs px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500">pending</span>
                        {/if}
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Segments</p>
                        <p class="text-sm font-semibold text-gray-800">{contribution.mapMatch?.segments.length ?? 0}</p>
                    </div>
                </div>

                <div class="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="text-sm text-gray-600">Data sharing level:</span>
                        <span class="text-sm px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-700">{contribution.privacyLevel ?? "account default"}</span>
                    </div>
                </div>

                {#if contribution.track.length >= 2}
                    <div
                        bind:this={mapContainer}
                        class="w-full h-[500px] rounded-xl border border-gray-200 overflow-hidden"
                    ></div>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span class="flex items-center gap-1.5"><span class="inline-block w-4 h-0.5 bg-[#ef4823] opacity-50"></span> GPS track</span>
                        {#if contribution.mapMatch && contribution.mapMatch.segments.length > 0}
                            <span class="flex items-center gap-1.5"><span class="inline-block w-4 h-0.5 bg-[#2563eb]"></span> Matched route</span>
                        {/if}
                    </div>
                {:else}
                    <p class="text-gray-500 text-sm">No GPS track available for this contribution.</p>
                {/if}
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
