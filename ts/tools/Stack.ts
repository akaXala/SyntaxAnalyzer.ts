class Stack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    public push(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    public pop(): T | undefined {
        return this.storage.pop();
    }

    public peek(): T | undefined {
        return this.storage[this.size() - 1];
    }

    public size(): number {
        return this.storage.length;
    }

    public clear(): void {
        this.storage = [];
    }

    public isEmpty(): boolean {
        return this.size() === 0;
    }
}
export { Stack };