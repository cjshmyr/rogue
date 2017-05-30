class Geometry
{
    static pointsInBox(center: Point, range: number) : Point[] {
        let points: Point[] = [];

        for (let y = center.y - range; y <= center.y + range; y++) {
            for (let x = center.x - range; x <= center.x + range; x++) {
                points.push(new Point(x,y));
            }
        }

        return points;
    }

    static pointsInCircle(center: Point, range: number) : Point[] {
        let pointsInBox = this.pointsInBox(center, range);
        let points: Point[] = [];

        for (let p of pointsInBox) {
            if (Point.distanceSquared(center, p) <= range * range) {
                points.push(p);
            }
        }

        return points;
    }

    static pointsInAnnulus(center: Point, range: number, thickness: number = 1) : Point[] {
        let points: Point[] = [];

        // Perhaps replace with Midpoint algorithm
        let pointsInCircle = this.pointsInCircle(center, range);
        let pointsInInnerCircle = this.pointsInCircle(center, range - thickness);

        for (let p of pointsInCircle) {
            let isInInnerCircle = false;

            for (let q of pointsInInnerCircle) {
                if (p.equals(q)) {
                    isInInnerCircle = true;
                    break;
                }
            }

            if (!isInInnerCircle) {
                points.push(p);
            }
        }

        return points;
    }

    static pointsInLine(start: Point, end: Point) : Point[] {
        // Taken from http://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
        let points: Point[] = [];

        let p1 = new Point(start.x, start.y);
        let p2 = new Point(end.x, end.y);

        let dx = Math.abs(p2.x - p1.x);
        let dy = Math.abs(p2.y - p1.y);
        let sx = (p1.x < p2.x) ? 1 : -1;
        let sy = (p1.y < p2.y) ? 1 : -1;
        let err = dx-dy;

        while (true) {
            points.push(new Point(p1.x, p1.y));  // Do what you need to for this

            if (p1.equals(p2)) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; p1.x += sx; }
            if (e2 < dx) { err += dx; p1.y += sy; }
        }

        return points;
    }

    pointsAsString(points: Point[]) : string {
        let s = '';
        for (let p of points) {
            if (s == '')
                s = '(' + p.x + ',' + p.y + ')'
            else
                s += ',(' + p.x + ',' + p.y + ')'
        }
        return s;
    }
}