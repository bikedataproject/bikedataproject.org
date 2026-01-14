import { settings } from "./settings";

export class AppManagerSettings {
    public readonly public_url: string;
    public readonly root_url: string;
    public readonly auth: AuthSettings;

    constructor() {
        const url = new URL(settings.public_url);

        this.public_url = url.href;
        if (this.public_url.endsWith("/")) this.public_url = this.public_url.substring(0, this.public_url.length - 1);
        this.root_url = url.origin;
        if (this.root_url.endsWith("/")) this.root_url = this.root_url.substring(0, this.root_url.length - 1);

        this.auth = new AuthSettings(settings.auth);
    }
}

export class AuthSettings
{
    public readonly authority: string;
    public readonly client_id: string;
    public readonly scope: string;

    constructor(auth_settings:{ authority: string, client_id: string, scope: string }){
        this.authority = auth_settings.authority;
        this.client_id = auth_settings.client_id;
        this.scope = auth_settings.scope;
    }
}

export class ApiUrls {
    public readonly project_api: string;
    public readonly publish: string;
    public readonly edit: string;
    public readonly publish_tiles: string;
    public readonly identity: string;
    public readonly counters: string;
    public readonly random_locations: string;

    constructor(api_settings: { projects: string, publish: string, publish_tiles: string, edit: string, identity: string, counters: string, random_locations: string }) {
        this.project_api = api_settings.projects;
        this.publish_tiles = api_settings.publish_tiles;
        this.publish = api_settings.publish;
        this.edit = api_settings.edit;
        this.identity = api_settings.identity;
        this.counters = api_settings.counters;
        this.random_locations = api_settings.random_locations;
    }
}