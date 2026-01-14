export class HashSetString {

    constructor(init?: string[]) {
        if (typeof init === "undefined") return;

        init.forEach(i => {
            this[i] = true;
        });
    }

    isEmpty(): boolean {
        for (const key in this) {
            return false;
        }
        return true;
    }

    remove(value: string): void {
        delete this[value];
    }

    set(value: string): void {
        this[value] = true;
    }

    contains(key: string) {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    forEach(func: (key: string) => void) {
        for (const key in this) {
            func(key);
        }
    }

    entries(): string[] {
        const keys: string[] = [];
        for (const key in this) {
            keys.push(key);
        }
        return keys;
    }

    clear(): void {
        const keys = this.entries();
        keys.forEach(k => delete this[k]);
    }
}
