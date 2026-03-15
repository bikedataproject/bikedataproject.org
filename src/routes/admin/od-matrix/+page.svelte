<script lang="ts">
    import { onMount } from "svelte";
    import maplibregl from "maplibre-gl";
    import "maplibre-gl/dist/maplibre-gl.css";
    import { latLngToCell, cellToBoundary } from "h3-js";
    import PrivatePage from "$lib/auth/PrivatePage.svelte";
    import NavBar from "$lib/home/NavBar.svelte";
    import Footer from "$lib/home/Footer.svelte";
    import { appManager } from "$lib/AppManager";

    const SELECTION_RESOLUTION = 7;

    type OdPoint = {
        type: string;
        h3Index: string | null;
        edgeGlobalId: string | null;
        lng: number;
        lat: number;
    };

    type OdPair = {
        origin: OdPoint;
        destination: OdPoint;
        tripCount: number;
        uniqueRiders: number;
        suppressed: boolean;
    };

    type OdMatrixResponse = {
        h3Resolution: number;
        totalRoutes: number;
        minUniqueRiders: number;
        wouldBeSuppressed: number;
        odPairs: OdPair[];
    };

    let mapContainer = $state<HTMLDivElement>();
    let map: maplibregl.Map | null = null;

    let selectedCells = $state(new Set<string>());
    let indexedCellCount = $state(0);
    let odResult: OdMatrixResponse | null = $state(null);
    let loading = $state(false);
    let error: string | null = $state(null);
    let h3Resolution = $state(8);

    onMount(() => {
        return () => {
            map?.remove();
            map = null;
        };
    });

    $effect(() => {
        if (mapContainer && !map) {
            initMap();
        }
    });

    function cellToGeoJSON(cell: string): number[][] {
        const boundary = cellToBoundary(cell);
        // h3-js returns [lat, lng] pairs; GeoJSON needs [lng, lat], and polygon must be closed
        const coords = boundary.map(([lat, lng]) => [lng, lat]);
        coords.push(coords[0]);
        return coords;
    }

    function initMap() {
        map = new maplibregl.Map({
            container: mapContainer,
            style: "https://api.maptiler.com/maps/67ea3b5b-d4ac-48f3-ad92-6574c2dc9734/style.json?key=OZUCIh4RNx38vXF8gF4H",
            center: [4.35, 50.85],
            zoom: 10
        });

        map.addControl(new maplibregl.NavigationControl(), "top-right");

        map.on("load", () => {
            // Source for indexed (non-empty) cells — shown as a subtle background
            map!.addSource("indexed-cells", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] }
            });

            map!.addLayer({
                id: "indexed-cells-fill",
                type: "fill",
                source: "indexed-cells",
                paint: {
                    "fill-color": "#2563eb",
                    "fill-opacity": 0.08
                }
            });

            map!.addLayer({
                id: "indexed-cells-outline",
                type: "line",
                source: "indexed-cells",
                paint: {
                    "line-color": "#2563eb",
                    "line-width": 1,
                    "line-opacity": 0.25
                }
            });

            // Source for selected hex cells (rendered above indexed cells)
            map!.addSource("selected-cells", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] }
            });

            map!.addLayer({
                id: "selected-cells-fill",
                type: "fill",
                source: "selected-cells",
                paint: {
                    "fill-color": "#ef4823",
                    "fill-opacity": 0.25
                }
            });

            map!.addLayer({
                id: "selected-cells-outline",
                type: "line",
                source: "selected-cells",
                paint: {
                    "line-color": "#ef4823",
                    "line-width": 2,
                    "line-opacity": 0.8
                }
            });

            // Source for OD matrix lines
            map!.addSource("od-lines", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] }
            });

            map!.addLayer({
                id: "od-lines-layer",
                type: "line",
                source: "od-lines",
                layout: { "line-cap": "round", "line-join": "round" },
                paint: {
                    "line-color": ["case",
                        ["==", ["get", "originType"], "boundary"], "#f59e0b",
                        ["==", ["get", "destType"], "boundary"], "#f59e0b",
                        "#2563eb"
                    ],
                    "line-width": ["interpolate", ["linear"], ["get", "tripCount"], 1, 2, 50, 8],
                    "line-opacity": 0.7
                }
            });

            // Source for OD points
            map!.addSource("od-points", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] }
            });

            map!.addLayer({
                id: "od-points-layer",
                type: "circle",
                source: "od-points",
                paint: {
                    "circle-radius": 5,
                    "circle-color": ["case",
                        ["==", ["get", "role"], "origin"], "#22c55e",
                        "#ef4444"
                    ],
                    "circle-stroke-width": 1.5,
                    "circle-stroke-color": "#ffffff",
                    "circle-opacity": 0.9
                }
            });

            // Load indexed cells to show where data exists
            loadIndexedCells();
        });

        map.on("click", (e) => {
            if (loading) return;

            const cell = latLngToCell(e.lngLat.lat, e.lngLat.lng, SELECTION_RESOLUTION);
            const newSelected = new Set(selectedCells);

            if (newSelected.has(cell)) {
                newSelected.delete(cell);
            } else {
                newSelected.add(cell);
            }

            selectedCells = newSelected;
            updateSelectedCellsLayer();
        });

        // Change cursor to pointer on hover
        map.getCanvas().style.cursor = "pointer";
    }

    async function loadIndexedCells() {
        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;

            const res = await fetch(`${appManager.settings.api_url}/api/od-matrix/cells`, {
                headers: { Authorization: "Bearer " + user.access_token }
            });
            if (!res.ok) return;

            const data: { resolution: number; cells: string[] } = await res.json();
            indexedCellCount = data.cells.length;

            if (!map || !map.getSource("indexed-cells")) return;

            const features = data.cells.map(cell => ({
                type: "Feature" as const,
                properties: { cell },
                geometry: {
                    type: "Polygon" as const,
                    coordinates: [cellToGeoJSON(cell)]
                }
            }));

            const fc = { type: "FeatureCollection" as const, features };
            (map.getSource("indexed-cells") as maplibregl.GeoJSONSource).setData(fc);

            // Fit map to indexed cells bounds
            if (features.length > 0) {
                const bounds = new maplibregl.LngLatBounds();
                for (const f of features) {
                    for (const coord of f.geometry.coordinates[0]) {
                        bounds.extend(coord as [number, number]);
                    }
                }
                map.fitBounds(bounds, { padding: 40 });
            }
        } catch {
            // Silently ignore — indexed cells are a convenience overlay
        }
    }

    function updateSelectedCellsLayer() {
        if (!map || !map.getSource("selected-cells")) return;

        const features = Array.from(selectedCells).map(cell => ({
            type: "Feature" as const,
            properties: { cell },
            geometry: {
                type: "Polygon" as const,
                coordinates: [cellToGeoJSON(cell)]
            }
        }));

        (map.getSource("selected-cells") as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features
        });
    }

    function clearSelection() {
        selectedCells = new Set();
        odResult = null;
        error = null;
        updateSelectedCellsLayer();
        clearOdLayers();
    }

    function clearOdLayers() {
        if (!map) return;
        const linesSrc = map.getSource("od-lines") as maplibregl.GeoJSONSource | undefined;
        const pointsSrc = map.getSource("od-points") as maplibregl.GeoJSONSource | undefined;
        linesSrc?.setData({ type: "FeatureCollection", features: [] });
        pointsSrc?.setData({ type: "FeatureCollection", features: [] });
    }

    async function fetchOdMatrix() {
        if (selectedCells.size === 0) return;

        loading = true;
        error = null;
        odResult = null;
        clearOdLayers();

        try {
            const user = await appManager.authenticator.getUserIdOrRedirect();
            if (!user) return;

            const res = await fetch(`${appManager.settings.api_url}/api/od-matrix`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + user.access_token
                },
                body: JSON.stringify({
                    cells: Array.from(selectedCells),
                    h3Resolution
                })
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                error = body?.error ?? `Request failed: ${res.statusText}`;
                return;
            }

            odResult = await res.json();
            renderOdMatrix();
        } catch (e: any) {
            error = e.message ?? "Network error";
        } finally {
            loading = false;
        }
    }

    function renderOdMatrix() {
        if (!map || !odResult) return;

        // Build line features
        const lineFeatures = odResult.odPairs.map((pair, i) => ({
            type: "Feature" as const,
            properties: {
                index: i,
                tripCount: pair.tripCount,
                uniqueRiders: pair.uniqueRiders,
                originType: pair.origin.type,
                destType: pair.destination.type
            },
            geometry: {
                type: "LineString" as const,
                coordinates: [
                    [pair.origin.lng, pair.origin.lat],
                    [pair.destination.lng, pair.destination.lat]
                ]
            }
        }));

        (map.getSource("od-lines") as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: lineFeatures
        });

        // Build point features (unique origins and destinations)
        const pointFeatures: any[] = [];
        const seen = new Set<string>();

        for (const pair of odResult.odPairs) {
            const oKey = `o:${pair.origin.lng},${pair.origin.lat}`;
            if (!seen.has(oKey)) {
                seen.add(oKey);
                pointFeatures.push({
                    type: "Feature",
                    properties: { role: "origin", type: pair.origin.type },
                    geometry: { type: "Point", coordinates: [pair.origin.lng, pair.origin.lat] }
                });
            }
            const dKey = `d:${pair.destination.lng},${pair.destination.lat}`;
            if (!seen.has(dKey)) {
                seen.add(dKey);
                pointFeatures.push({
                    type: "Feature",
                    properties: { role: "destination", type: pair.destination.type },
                    geometry: { type: "Point", coordinates: [pair.destination.lng, pair.destination.lat] }
                });
            }
        }

        (map.getSource("od-points") as maplibregl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features: pointFeatures
        });
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

            <h2 class="mb-2">OD Matrix</h2>
            <p class="text-sm text-gray-500 mb-6">Click hex cells on the map to select an area, then generate the origin-destination matrix.</p>

            <!-- Controls bar -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <label for="h3res" class="text-sm text-gray-600">OD Resolution:</label>
                    <select id="h3res" bind:value={h3Resolution} class="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                        {#each [6, 7, 8, 9, 10] as r}
                            <option value={r}>{r}</option>
                        {/each}
                    </select>
                </div>

                <span class="text-sm text-gray-400">|</span>

                <span class="text-sm text-gray-600">{selectedCells.size} cell{selectedCells.size !== 1 ? "s" : ""} selected</span>

                <button
                    onclick={clearSelection}
                    disabled={selectedCells.size === 0}
                    class="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Clear
                </button>

                <button
                    onclick={fetchOdMatrix}
                    disabled={selectedCells.size === 0 || loading}
                    class="text-sm px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? "Loading..." : "Generate"}
                </button>
            </div>

            {#if error}
                <div class="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            {/if}

            <!-- Map -->
            <div
                bind:this={mapContainer}
                class="w-full h-[600px] rounded-xl border border-gray-200 overflow-hidden"
            ></div>

            <!-- Legend -->
            <div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-3 h-3 rounded-sm bg-[#2563eb]/10 border border-[#2563eb]/25"></span>
                    Has data{#if indexedCellCount > 0} ({indexedCellCount.toLocaleString()} cells){/if}
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-3 h-3 rounded-sm bg-primary/25 border border-primary"></span>
                    Selected area
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-4 h-0.5 bg-[#2563eb]"></span>
                    Interior flow
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-4 h-0.5 bg-[#f59e0b]"></span>
                    Boundary flow
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-3 h-3 rounded-full bg-[#22c55e] border border-white"></span>
                    Origin
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="inline-block w-3 h-3 rounded-full bg-[#ef4444] border border-white"></span>
                    Destination
                </span>
            </div>

            <!-- Results summary -->
            {#if odResult}
                <div class="mt-6 grid gap-4 sm:grid-cols-4 max-w-2xl">
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Routes</p>
                        <p class="text-lg font-bold text-gray-800">{odResult.totalRoutes.toLocaleString()}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">OD Pairs</p>
                        <p class="text-lg font-bold text-gray-800">{odResult.odPairs.length.toLocaleString()}</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Would Be Suppressed</p>
                        <p class="text-lg font-bold text-gray-800">{odResult.wouldBeSuppressed.toLocaleString()}</p>
                        <p class="text-xs text-gray-400 mt-0.5">min {odResult.minUniqueRiders} riders</p>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">H3 Resolution</p>
                        <p class="text-lg font-bold text-gray-800">{odResult.h3Resolution}</p>
                    </div>
                </div>

                <!-- OD pairs table -->
                {#if odResult.odPairs.length > 0}
                    <div class="mt-6 overflow-x-auto">
                        <table class="w-full text-sm border-collapse">
                            <thead>
                                <tr class="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                                    <th class="py-2 pr-4">Origin</th>
                                    <th class="py-2 pr-4">Destination</th>
                                    <th class="py-2 pr-4 text-right">Trips</th>
                                    <th class="py-2 text-right">Unique Riders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each odResult.odPairs.sort((a, b) => b.tripCount - a.tripCount) as pair}
                                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                                        <td class="py-2 pr-4">
                                            <span class="text-xs px-2 py-0.5 rounded-full border {pair.origin.type === 'interior' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}">{pair.origin.type}</span>
                                            <span class="ml-1 text-gray-500 text-xs font-mono">{pair.origin.h3Index ?? pair.origin.edgeGlobalId?.substring(0, 8)}</span>
                                        </td>
                                        <td class="py-2 pr-4">
                                            <span class="text-xs px-2 py-0.5 rounded-full border {pair.destination.type === 'interior' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}">{pair.destination.type}</span>
                                            <span class="ml-1 text-gray-500 text-xs font-mono">{pair.destination.h3Index ?? pair.destination.edgeGlobalId?.substring(0, 8)}</span>
                                        </td>
                                        <td class="py-2 pr-4 text-right font-semibold">{pair.tripCount}</td>
                                        <td class="py-2 text-right">{pair.uniqueRiders}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            {/if}
        </section>
    </div>
    <Footer />
</PrivatePage>
