// Operates under the assumption that we can have 1 actor per layer.
class CellLayer {
    private cells: Actor[][];
    count: number;
    usedCount: number;

    constructor(maxX: number, maxY: number) {
        this.cells = [];
        let count = 0;

        for (let y = 0; y < maxY; y++) {
            this.cells[y] = [];
            for (let x = 0; x < maxY; x++) {
                this.cells[y][x] = null;
                count++;
            }
        }

        this.count = count;
        this.usedCount = 0;
    }

    public addActor(x: number, y: number, a: Actor) : void {
        this.cells[y][x] = a;
        this.usedCount++;
    }

    public removeActor(x: number, y: number, a: Actor) : void {
        this.cells[y][x] = null;
        this.usedCount--;
    }

    public getActor(x: number, y: number) : Actor {
        return this.cells[y][x];
    }
}