export interface ApiSettings {
    url: string,
    getAccessToken: () => Promise<string>,
}