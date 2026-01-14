export class HashSetNumber {

    constructor(init?: number[]) {
        if (typeof init === "undefined") return;

        init.forEach(i => {
            this[i] = true;
        });
    }

    remove(value: number): void {
        this[value] = undefined;
    }

    set(value: number): void {
        this[value] = true;
    }

    contains(key: number) {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    forEach(func: (key: number) => void) {
        for (const key in this) {
            func(Number(key));
        }
    }

    entries(): number[] {
        const keys: number[] = [];
        for (const key in this) {
            keys.push(Number(key));
        }
        return keys;
    }

    clear(): void {
        const keys = this.entries();
        keys.forEach(k => delete this[k]);
    }
}
