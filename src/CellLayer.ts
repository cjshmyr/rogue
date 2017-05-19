class CellLayer {
    private cells: Actor[][][]; // [x,y] = Actor[]
    count: number;
    actorCount: number;

    constructor(maxX: number, maxY: number) {
        this.cells = [];
        let count = 0;

        for (let y = 0; y < maxY; y++) {
            this.cells[y] = [];
            for (let x = 0; x < maxX; x++) {
                this.cells[y][x] = []; // Different; empty array
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
                for (let a of this.cells[y][x]) {
                    actors.push(a);
                }
            }
        }
        return actors;
    }

    public addActor(a: Actor, x: number, y: number) : void {
        this.cells[y][x].push(a);
        this.actorCount++;
    }

    public removeActor(a: Actor, x: number, y: number) : void {
        let index: number = this.cells[y][x].indexOf(a, 0);
        if (index > -1) {
            this.cells[y][x].splice(index, 1);
        }
        else {
            alert('removeActor: else statement hit');
        }
        this.actorCount--;
    }

    public moveActor(a: Actor, newX: number, newY: number) : void { // TODO: Support point as a parameter. Can we somehow just make 'setActorPosition' a thing?
        this.removeActor(a, a.position.x, a.position.y);
        this.addActor(a, newX, newY);
    }

    public actorsAt(x: number, y: number) : Actor[] {
        return this.cells[y][x];
    }
}