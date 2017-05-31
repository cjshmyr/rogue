class CellLayer {
    private cells: Actor[][];
    cellCount: number;
    actorCount: number;
    readonly width: number;
    readonly height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.cells = [];
        let count = 0;

        for (let y = 0; y < height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < width; x++) {
                this.cells[y][x] = null;
                count++;
            }
        }

        this.cellCount = count;
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

    // Returns a 2d array of 0s and 1s, of what is pathable/unpathable.
    // Start and End are always considered pathable.
    static getPathfindMatrixForCellLayers(cellLayers: CellLayer[], start: Point, end: Point) : number[][] {
        // All layers should have same w/h
        let width = cellLayers[0].width;
        let height = cellLayers[0].height;

        // Set all nodes as open (0)
        let matrix = [];
        for (let y = 0; y < height; y++) {
            matrix[y] = [];
            for (let x = 0; x < width; x++) {
                matrix[y][x] = 0;
            }
        }

        // Set blocked where appropriate (1)...
        for (let c of cellLayers) {
            for (let a of c.getActors()) {
                if (a.blocksMovement) {
                    matrix[a.position.y][a.position.x] = 1;
                }
            }
        }

        // But *exclude* start and end.
        matrix[start.y][start.x] = 0;
        matrix[end.y][end.x] = 0;

        return matrix;
    }
}