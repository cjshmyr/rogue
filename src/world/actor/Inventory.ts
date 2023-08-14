import { Item } from "./Item";

export class Inventory {
    items: Item[] = [];

    constructor() {

    }

    addItem(item: Item) : void {
        this.items.push(item);
    }
}