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

    getActors() : Actor[] {
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

    addActor(a: Actor, x: number, y: number) : void {
        if (this.cells[y][x] == null) {
            this.cells[y][x] = a;
            this.actorCount++;
        }
        else {
            console.log('addActor: actor already exists at this position (no operation performed)');
        }
    }

    removeActor(a: Actor, x: number, y: number) : void {
        if (this.cells[y][x] != null) {
            this.cells[y][x] = null;
            this.actorCount--;
        }
        else {
            console.log('removeActor: actor was already removed, or not part of layer (no operation performed)');
        }
    }

    moveActor(a: Actor, newX: number, newY: number) : void { // TODO: Support point as a parameter.
        this.removeActor(a, a.position.x, a.position.y);
        this.addActor(a, newX, newY);
    }

    actorAt(x: number, y: number) : Actor {
        return this.cells[y] != null && this.cells[y][x] != null ? this.cells[y][x] : null; // TODO: We need to start excluding OOB.
    }

    actorsInCircle(center: Point, radius: number) : Actor[] {
        let actors: Actor[] = [];
        let circle = Geometry.pointsInCircle(center, radius);

        for (let p of circle) {
            if (this.cells[p.y] != null && this.cells[p.y][p.x] != null) { // Circles may reach OOB
                actors.push(this.cells[p.y][p.x]);
            }
        }

        return actors;
    }

    asPathfinderCellMatrix() : number[][] {
        // Returns a matrix with 0 as pathable, 1 as unpathable cells.
        let matrix = [];
        for (let y = 0; y < this.cells.length; y++) {
            matrix[y] = [];
            for (let x = 0; x < this.cells[y].length; x++) {
                matrix[y][x] = this.cells[y][x] == null ? 0 : 1;
            }
        }
        return matrix;
    }
}