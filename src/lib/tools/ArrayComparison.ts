export class ArrayComparison {
    public static elementsEqual<T>(array1: T[], array2: T[]): boolean {
        const setA = new Set(array1);
        const setB = new Set(array2);

        if (setA.size !== setB.size) return false;

        for (const value of setA) {
            if (!setB.has(value)) return false;
        }

        return true;
    }
}