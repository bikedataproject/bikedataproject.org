import type {DirtyTriggerState} from "$lib/tools/DirtyTriggerState";
import {ReadonlyStore, Store} from "$lib/tools/Store";

export class DirtyTrigger implements DirtyTriggerTransaction {
    private readonly period: number;
    private readonly asyncCallBack: DirtyTriggerAsyncCallback;
    private readonly idleStore: Store<boolean> = new Store<boolean>(true);
    private timeout: number | undefined;

    private state: DirtyTriggerState = "idle";
    private triggerCallback: Promise<boolean> | undefined;
    private suspended: boolean = false;

    private constructor(period: number, asyncCallBack: DirtyTriggerAsyncCallback, suspended: boolean = false) {
        this.period = period;
        this.asyncCallBack = asyncCallBack;
        this.suspended = suspended;
    }

    private setState(state: DirtyTriggerState) {
        this.state = state;

        const isIdle = this.state === "idle";
        if (isIdle === this.idleStore.get()) return;
        this.idleStore.set(isIdle);
    }

    public getIdleStore(): ReadonlyStore<boolean> {
        return this.idleStore;
    }

    private stopTimeout() {
        if (this.timeout === undefined) return;

        clearTimeout(this.timeout);
        this.timeout = undefined;
    }

    private startTimeout() {
        if (this.timeout !== undefined) throw new Error("The previous timeout is still waiting, cancel it first");

        this.timeout = setTimeout(async () => {
            if (this.state === "dirty") this.setState("triggered");
            if (this.state !== "triggered") return;

            this.triggerCallback = this.asyncCallBack(() => true);
            const ok = await this.triggerCallback;
            this.triggerCallback = undefined;

            if (!ok) {
                this.trigger();
                return;
            }

            this.setState("idle");
        }, this.period);
    }

    private async run(): Promise<void> {
        await this.waitForUpdateOrTrigger();
        if (this.state === "idle") return;

        let transaction: DirtyTriggerTransaction | undefined = await this.startTransaction();

        try {
            transaction.commit();
            transaction = undefined;
        } catch (e) {
            throw e;
        } finally {
            transaction?.cancel();
        }
    }

    private trigger() {
        if (this.suspended) return;

        this.stopTimeout();
        this.startTimeout();
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async waitForUpdateOrTrigger() {
        // first wait until the current trigger job has finished.
        if (this.triggerCallback !== undefined) await this.triggerCallback;

        let i = 0;
        while (this.state === "triggered" ||
        this.state === "updating") {
            await this.sleep(200);

            i++;
            if (i > 100) throw Error("Timeout, cannot wait any longer to start the update");
        }
    }

    public isIdle(): boolean {
        return this.state === "idle";
    }

    public async setDirty() {
        await this.startTransaction();

        this.commit();
    }

    public async startTransaction(): Promise<DirtyTriggerTransaction> {
        await this.waitForUpdateOrTrigger();

        let i = 0;
        while (this.state === "triggered" ||
        this.state === "updating") {
            await this.sleep(200);

            i++;
            if (i > 100) throw Error("Timeout, cannot wait any longer to start the update");
        }
        this.setState("updating");
        console.log(`start transaction: ${this.state.toString()}`);

        return this;
    }

    public commit() {
        if (this.state !== "updating") throw Error("Cannot end an update when update is not in progress");

        this.setState("dirty");
        console.log(`commit: ${this.state.toString()} - ${this.suspended}`);
        this.trigger();
    }

    public cancel() {
        if (this.state === "idle") return;
        if (this.state !== "updating") {
            throw Error("Cannot end an update when update is not in progress");
        }

        this.setState("idle");
        console.log(`cancel: ${this.state.toString()}`);
    }

    public static CreateAsync(callback: DirtyTriggerAsyncCallback, period: number = 500, suspended: boolean = false): DirtyTrigger {
        return new DirtyTrigger(period, callback, suspended);
    }

    public suspend(){
        this.suspended = true;
    }

    public resume() {
        this.suspended = false;

        if (this.state === "dirty") this.trigger();
    }
}

export interface DirtyTriggerTransaction {
    commit(): void;
    cancel(): void;
}

export type DirtyTriggerAsyncCallback = (signal: StillDirtySignal) => Promise<boolean>;

export type StillDirtySignal = () => boolean;