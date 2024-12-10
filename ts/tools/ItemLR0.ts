class ItemLR0 {
    private ruleNumber: number;
    private dotIndex: number;
    constructor();
    constructor(rule: number, dot: number);
    constructor(rule?: number, dot?: number) {
        this.ruleNumber = (rule !== undefined) ? rule : -1;
        this.dotIndex = (dot !== undefined) ? dot : -1;
    }
    public getruleNumber(): number {
        return this.ruleNumber;
    }
    public setruleNumber(rule: number): void {
        this.ruleNumber = rule;
    }
    public getdotIndex(): number {
        return this.dotIndex;
    }
    public setdotIndex(dot: number): void {
        this.dotIndex = dot;
    }
    equals(item: ItemLR0): boolean {
        return (this.ruleNumber == item.ruleNumber && this.dotIndex == item.dotIndex);
    }
    getHashCode(): number {

        //return this.ruleNumber * 100 + this.dotIndex;
        return -1;
    }
}

class SetItemsLR0 {
    i: number;
    items: Set<ItemLR0>;
    constructor(i: number) {
        this.i = i;
        this.items = new Set();
    }
    equalsItems(set: Set<ItemLR0>): boolean {
        if (this.items.size !== set.size) return false;
        const setSubSetItems = [...this.items].filter((x) =>
            [...set].filter((y) => y.equals(x)).length === 0
        ).length === 0;
        const itemsSubSetSet = [...set].filter((x) =>
            [...this.items].filter((y) => y.equals(x)).length === 0
        ).length === 0;
        return setSubSetItems && itemsSubSetSet;
    }
    has(item: ItemLR0): boolean {
        return [...this.items].filter((x) => x.equals(item)).length == 1;
    }



}
export { ItemLR0, SetItemsLR0 };