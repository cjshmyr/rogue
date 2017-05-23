class Inventory {
    items: Item[] = [];
    gold: number = 0;

    constructor() {

    }

    addItem(item: Item) : void {
        this.items.push(item);
    }
}