export class Dictionary<T> {

    isEmpty(): boolean {
        for (const key in this) {
            return false;
        }
        return true;
    }

    count(): number {
        let i = 0;
        for (const key in this) {
            i++;
        }
        
        return i;
    }

    add(key: string, value: T): void {
        if (typeof this[key] !== "undefined") throw new Error("key already exists");

        this[key] = value;
    }

    get(key: string): T | undefined {
        return this[key] as T;
    }

    set(key: string, value: T): void {
        this[key] = value;
    }

    update(key: string, updater: (value?: T) => T) {
        const result = updater(this[key] as T);
        this[key] = result;
    }

    remove(key: string): void {
        delete this[key];
    }

    keys(): string[] {
        const keys: string[] = [];
        for (const key in this) {
            keys.push(key);
        }
        return keys;
    }

    keysForEach(func: (key: string) => void): void {
        for (const key in this) {
            func(key);
        }
    }

    async keysForEachAsync(func: (key: string) => Promise<boolean>): Promise<boolean> {
        for (const key in this) {
            if (!await func(key)) return false;
        }
        return true;
    }

    values(): T[] {
        const values: T[] = [];
        for (const key in this) {
            values.push(this[key] as unknown as T);
        }
        return values;
    }

    keysAndValues(): { key: string, value: T }[] {
        const values: { key: string, value: T }[] = [];
        for (const key in this) {
            values.push({
                key: key,
                value: this[key] as unknown as T
            });
        }
        return values;
    }

    valuesForEach(func: (value: T) => void): void {
        for (const key in this) {
            func(this[key] as unknown as T);
        }
    }

    forEach(func: (key: string, value: T) => void): void {
        this.keysForEach(k => {
            func(k, this.get(k)!);
        });
    }

    async forEachAsync(func: (key: string, value: T) => Promise<boolean>): Promise<boolean> {
        await this.keysForEachAsync(async k => {
            if (!await func(k, this.get(k)!)) return false;

            return true;
        });

        return true;
    }

    containsKey(key: string): boolean {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    clear(): void {
        const keys = this.keys();
        // @ts-ignore
        keys.forEach(k => delete this[k]);
    }

    copyFrom(other: Dictionary<T>): void {
        other.keys().forEach(x => {
            const val = other.get(x)!;

            this.add(x, val);
        });
    }
}