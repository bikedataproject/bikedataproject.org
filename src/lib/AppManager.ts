import {User, WebStorageStateStore} from "oidc-client-ts";
import { AppManagerSettings } from "./AppManagerSettings";
import { Authenticator } from "$lib/auth/Authenticator";
import {addMessages, getLocaleFromNavigator, init, locale} from "svelte-i18n";
import {v4 as uuidv4} from "uuid";

export class AppManager {
    public readonly authenticator: Authenticator;
    public readonly settings: AppManagerSettings = new AppManagerSettings();

    private readonly unloadSubscribers: { [id: symbol]: () => (() => void) | undefined } = {};

    public readonly colors = {
        primary: "#ffc000",
        trips: {
            //positive: "#ffc000",
            positive: "#1b2a4e",
            negative: "#F00"
        },
    }

    constructor() {
        //
        // // locale setup
        // // @ts-ignore
        // addMessages("en", en);
        // //addMessages("nl", nl);
        // init({
        //     fallbackLocale: "en",
        //     initialLocale: getLocaleFromNavigator(),
        // });

        this.authenticator = new Authenticator({
            authority: this.settings.auth.authority,
            client_id: this.settings.auth.client_id,
            redirect_uri: `${this.settings.public_url}/callback`,
            post_logout_redirect_uri: `${this.settings.public_url}`,
            silent_redirect_uri: `${this.settings.public_url}/silent`,
            response_type: "code",
            scope: this.settings.auth.scope,
            automaticSilentRenew: true,
            loadUserInfo: true,
            monitorSession: true,
            userStore: new WebStorageStateStore({
                prefix: "bdp",
                store: window.localStorage,
            })
        });

        // locale setup
        addMessages("en", {});
        addMessages("nl", {});
        init({
            fallbackLocale: "en",
            initialLocale: getLocaleFromNavigator(),
        });
    }

    // public async getCurrentUserOrRedirect(): Promise<UserDetails> {
    //     if (typeof this.currentUser == "undefined") {
    //         const userId = await this.authenticator.getUserIdOrRedirect();
    //
    //         const userData = await appManager.identity_api.getUser({
    //             id: userId
    //         });
    //
    //         this.currentUser = new UserDetails(userData);
    //     }
    //
    //     return this.currentUser;
    // }

    public toHome(): string {
        return `${appManager.settings.public_url}`;
    }

    public getUuid(): string {
        return uuidv4();
    }

    public toAssets(path: string): string {
        return `${appManager.settings.public_url}${path}`;
    }

    public subscribeUnload(isDirty: () => (() => void) | undefined): () => void {
        const id = Symbol();
        this.unloadSubscribers[id] = isDirty;

        return () => {
            delete this.unloadSubscribers[id];
        }
    }

    public checkIsDirtyBeforeUnload(): (() => void) | undefined {
        for (const s of Object.getOwnPropertySymbols(this.unloadSubscribers)) {
            const isDirtyCallback = this.unloadSubscribers[s]();
            if (isDirtyCallback !== undefined) {
                return isDirtyCallback;
            }
        }

        return undefined;
    }
}

export const appManager = new AppManager();
