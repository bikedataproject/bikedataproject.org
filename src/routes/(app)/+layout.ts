import type {LayoutLoad} from "./$types";

export const load: LayoutLoad = async () => {
    return {
        layoutManager: await PageManager.create()
    };
};

class PageManager {

    constructor() {
    }

    public static async create(): Promise<PageManager> {
        return new PageManager();
    }
}