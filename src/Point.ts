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

    Equals(p: Point) : boolean {
        return this.x == p.x && this.y == p.y;
    }
}