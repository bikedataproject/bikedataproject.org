import type {PageLoad} from "./$types";
import {appManager} from "$lib/AppManager";

export const load: PageLoad = async () => {
    return {
        manager: PageManager.create()
    };
};

class PageManager {
    constructor() {

    }

    public static async create(): Promise<PageManager> {
        return new PageManager();
    }
}