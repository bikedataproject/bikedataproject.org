export class TriggerDelayed<T> {
    private readonly action: (data: T | undefined) => Promise<void>;
    private readonly delay: number;
    private controller: AbortController | undefined;
    private dataRequested: T | undefined;
    private timeout: NodeJS.Timeout | undefined;

    constructor(action: (data: T | undefined) => Promise<void>, delay: number = 500) {
        this.action = action;
        this.delay = delay;
    }

    public trigger(data: T | undefined): void {
        if (this.dataRequested == data) return;

        // abort any previous attempts.
        this.controller?.abort();

        this.dataRequested = data;

        // clear previous timeout and start new one.
        if (typeof this.timeout !== 'undefined') {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.action(this.dataRequested).then();
        }, this.delay);
    }
}