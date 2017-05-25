class CellLayer {
    private cells: Actor[][];
    count: number;
    actorCount: number;

    constructor(maxX: number, maxY: number) {
        this.cells = [];
        let count = 0;

        for (let y = 0; y < maxY; y++) {
            this.cells[y] = [];
            for (let x = 0; x < maxX; x++) {
                this.cells[y][x] = null;
                count++;
            }
        }

        this.count = count;
        this.actorCount = 0;
    }

    public getActors() : Actor[] {
        let actors = [];
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells[y].length; x++) {
                if (this.cells[y][x] != null) {
                    actors.push(this.cells[y][x]);
                }
            }
        }
        return actors;
    }

    public addActor(a: Actor, x: number, y: number) : void {
        if (this.cells[y][x] == null) {
            this.cells[y][x] = a;
            this.actorCount++;
        }
        else {
            console.log('addActor: actor already exists at this position (no operation performed)');
        }
    }

    public removeActor(a: Actor, x: number, y: number) : void {
        if (this.cells[y][x] != null) {
            this.cells[y][x] = null;
            this.actorCount--;
        }
        else {
            console.log('removeActor: actor was already removed, or not part of layer (no operation performed)');
        }
    }

    public moveActor(a: Actor, newX: number, newY: number) : void { // TODO: Support point as a parameter.
        this.removeActor(a, a.position.x, a.position.y);
        this.addActor(a, newX, newY);
    }

    public actorAt(x: number, y: number) : Actor {
        return this.cells[y][x];
    }
}