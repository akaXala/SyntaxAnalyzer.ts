class Queue<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) { }

    public enqueue(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Queue has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }
    public dequeue(): T | undefined {
        return this.storage.shift();
    }
    public size(): number {
        return this.storage.length;
    }
    public isEmpty(): boolean {
        return this.size() === 0;
    }
    public clear(): void {
        this.storage = [];
    }
    public front(): T | undefined {
        return this.storage[0];
    }
}
export { Queue };