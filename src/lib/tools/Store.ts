import type {Readable, Writable} from "svelte/store";

export abstract class ReadonlyStore<T> implements Readable<T>{
    protected value: T;
    protected subscribers: { [id: symbol]: Subscriber<T> } | undefined = undefined;

    protected constructor(initial: T) {
        this.value = initial;
    }

    public get() {
        return this.value;
    }

    public subscribe(subscriber: Subscriber<T>): Unsubscriber {
        subscriber(this.value);

        return this.subscribeUpdate(subscriber);
    }

    public subscribeUpdate(subscriber: Subscriber<T>): Unsubscriber {
        const id = Symbol();
        this.subscribers ??= {};
        this.subscribers[id] = subscriber;

        return () => {
            if (this.subscribers === undefined) return;

            delete this.subscribers[id];
        };
    }

    public derived<S>(to: (v: T) => S): ( Store<S> & { unsubscribe: Unsubscriber } ) {
        const otherValue = to(this.value);

        return new DerivedStore<S>(otherValue, n => {
            return this.subscribeUpdate(v => {
                n.set(to(v));
            });
        });
    }
}

export class Store<T> extends ReadonlyStore<T> implements Writable<T> {
    protected syncs: { [id: symbol]: {  from: Unsubscriber, to: Unsubscriber }} | undefined = undefined;

    constructor(initial: T) {
        super (initial);
    }

    public update(updater: (value: T) => T) {
        this.set(updater(this.value));
    }

    public async updateAsync(updater: (value: T) => Promise<T>) {
        this.set(await updater(this.value));
    }

    public set(value: T) {
        this.value = value;

        if (this.subscribers === undefined) return;
        for (const s of Object.getOwnPropertySymbols(this.subscribers)) {
            this.subscribers[s](this.value);
        }
    }

    public derivedSync<S>(to: (v: T) => S, from: (v: S) => T): Unsubscriber {
        const otherValue = to(this.value);

        const other = new Store<S>(otherValue);

        return this.sync(other, to, from);
    }

    public sync<S>(other: Store<S>, to: (v: T) => S, from: (v: S) => T): Unsubscriber {
        const s = Symbol();
        const fromLocal = (v: S) => {
            if (this.syncs === undefined || this.syncs[s] === undefined) return;
            this.syncs[s]?.to();

            const otherValue = from(v);

            this.syncs[s].to = this.subscribeUpdate(toLocal);

            return otherValue;
        };
        const toLocal = (v: T) => {
            if (this.syncs === undefined || this.syncs[s] === undefined) return;
            this.syncs[s]?.from();

            const otherValue = to(v);

            this.syncs[s].from = other.subscribeUpdate(fromLocal);

            return otherValue;
        };

        this.syncs ??= {};
        this.syncs[s] = {
            to: this.subscribeUpdate(toLocal),
            from: other.subscribeUpdate(fromLocal),
        };

        return () => {
            if (this.syncs === undefined) return;

            this.syncs[s]?.to();
            this.syncs[s]?.from();
            delete this.syncs[s];
        }
    }
}

export class DerivedStore<T> extends Store<T> {
    public readonly unsubscribe: Unsubscriber;

    constructor(initial: T, unsubscribe: (store: Store<T>) => Unsubscriber) {
        super(initial);

        this.unsubscribe = unsubscribe(this);
    }
}


export type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;