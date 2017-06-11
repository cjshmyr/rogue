class Inventory {
    items: Item[] = [];

    constructor() {

    }

    addItem(item: Item) : void {
        this.items.push(item);
    }
}