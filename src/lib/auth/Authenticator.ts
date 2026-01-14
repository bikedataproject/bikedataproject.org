import { Log, User, UserManager, type UserManagerSettings } from "oidc-client-ts";
import {appManager} from "$lib/AppManager";

export class Authenticator {
    private readonly config: UserManagerSettings;
    private readonly userManager: UserManager;
    private readonly events: any = { };

    constructor(config: UserManagerSettings) {
        this.config = config;

        Log.setLogger(console);

        this.userManager = new UserManager(config);
        this.userManager.events.addUserSignedOut(() => {
            this.raise("user-signedout");
        });
        this.userManager.events.addUserSignedIn(() => {
            this.raise("user-signedin");
        });
        this.userManager.events.addSilentRenewError(async () => {
            await this.logout();

            // when access token could not be renewed, redirect to home.
            window.location.href = `${appManager.settings.root_url}`;
        });
    }

    on(event: "login" | "logout" | "user-signedout" | "user-signedin", callback: () => void) {
        if (typeof this.events[event] === "undefined") this.events[event] = [];

        this.events[event].push(callback);
    }

    private raise(event: "login" | "logout" | "user-signedout" | "user-signedin") {
        if (typeof this.events[event] === "undefined") return;

        this.events[event].forEach(callback => {
            callback();
        });
    }

    async getUserIdOrRedirect(): Promise<User | undefined> {
        const user = await this.userManager.getUser();
        console.log(user);
        if (user == null || user.expired) {
            await this.startSignin(window.location.toString());
            return await this.userManager.getUser();
        }

        return user;
    }

    async getAccessTokenOrRedirect(): Promise<string> {
        const user = await this.userManager.getUser();
        if (user == null || user.expired) {
            await this.startSignin(window.location.toString());
            return "";
        }

        return user.access_token;
    }

    async isSignedIn(): Promise<boolean> {
        const user = await this.userManager.getUser();

        // if logged out, token cannot be expired.
        if (typeof user === "undefined") return false; 
        if (user == null) return false;
        if (user.expired) return false;

        return true;
    }

    async startSignin(url: string) {
        const user = await this.userManager.getUser();
        if (!user || user.expired) {

            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("redirect-url", url);
            }

            await this.userManager.signinRedirect({
                redirectMethod: "replace"
            });
            this.raise("login");
        }
    }

    async completeSignin(): Promise<string | undefined> {
        await this.userManager.signinRedirectCallback();

        if (typeof (Storage) !== "undefined") {
            return localStorage.getItem("redirect-url");
        }

        return undefined;
    }
    
    async signinSilentCallback(): Promise<boolean> {
        const user = await this.userManager.signinSilentCallback();

        return typeof user !== "undefined";
    }

    async logout(): Promise<void> {
        await this.userManager.removeUser();
        this.raise("logout");
    }
}