// A really stupid pathfinder. Eventually replace with A*.
class SimplePathfinder {
    static getClosestCellBetweenPoints(start: Point, end: Point) : Point {
        let up = Point.add(start, new Point(0,1));
        let down = Point.add(start, new Point(0, -1));
        let left = Point.add(start, new Point(-1, 0));
        let right = Point.add(start, new Point(1, 0));

        let upDistance = Point.distanceSquared(up, end);
        let downDistance = Point.distanceSquared(down, end);
        let leftDistance = Point.distanceSquared(left, end);
        let rightDistance = Point.distanceSquared(right, end);

        let distances = [upDistance, downDistance, leftDistance, rightDistance];
        let sorted = distances.sort((a,b) => { return a - b });

        if (sorted[0] == upDistance)
            return up;
        if (sorted[0] == downDistance)
            return down;
        if (sorted[0] == leftDistance)
            return left;
        if (sorted[0] == rightDistance)
            return right;
    }
}
