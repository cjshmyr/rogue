class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static add(p1: Point, p2: Point) : Point {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    }

    static subtract(p1: Point, p2: Point) : Point {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }

    static distanceSquared(p1: Point, p2: Point) : number {
        return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    }

    static distance(p1: Point, p2: Point) : number {
        return Math.sqrt(this.distanceSquared(p1, p2));
    }

    equals(p: Point) : boolean {
        return this.x == p.x && this.y == p.y;
    }

    /*
    toString() : string {
        return this.x + ',' + this.y;
    }
    */
}