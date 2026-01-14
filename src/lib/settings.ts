const settings = {
    public_url: "http://localhost:5000",
    apis: {
        projects: "https://api.anyways.eu/impact/canary/",
        identity: "https://www.anyways.eu/account/",
        edit: "https://api.anyways.eu/edit/",
        publish: "https://api.anyways.eu/publish/alternatives/",
        publish_tiles: "https://api.anyways.eu/publish/tiles/prerelease/",
        random_locations: "https://api.anyways.eu/data/random-locations/",
        trips: "https://api.anyways.eu/data/trips/",
        demand_model: "https://api.anyways.eu/data/demand-model/",
        counters: "https://api.anyways.eu/projects/counters/",
    },
    auth: {
        authority: "https://www.anyways.eu/account/",
        client_id: "website-webapp",
        scope: "openid profile impact roles identity shortcut",
    },
    api_keys: {
        opencage: "dcec93be31054bc5a260386c0d84be98",
    },
    profiles: [
        "bicycle.comfort_safety",
        "bicycle.comfort",
        "bicycle.commute",
        "bicycle.fast",
        "bicycle.safety",
        "bicycle.short",
        "car.fast",
        "car.short",
        "car.classifications",
        "bigtruck.fast",
        "bigtruck.short",
        "pedestrian.short",
        "pedestrian.slow_roads",
    ]
};

export { settings };