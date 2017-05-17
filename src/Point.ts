class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static Add(p1: Point, p2: Point) : Point {
        return new Point(p1.x + p2.x, p1.y + p2.y);
    }

    static DistanceSquared(p1: Point, p2: Point) : number {
        return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
    }

    static Distance(p1: Point, p2: Point) : number {
        return Math.sqrt(this.DistanceSquared(p1, p2));
    }

    Equals(p: Point) : boolean {
        return this.x == p.x && this.y == p.y;
    }

    /*
    toString() : string {
        return this.x + ',' + this.y;
    }
    */
}