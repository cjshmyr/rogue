// A really stupid pathfinder. Eventually replace with A*.
class SimplePathfinder {
    static GetClosestCellBetweenPoints(start: Point, end: Point) : Point {
        let up = Point.Add(start, new Point(0,1));
        let down = Point.Add(start, new Point(0, -1));
        let left = Point.Add(start, new Point(-1, 0));
        let right = Point.Add(start, new Point(1, 0));

        let upDistance = Point.DistanceSquared(up, end);
        let downDistance = Point.DistanceSquared(down, end);
        let leftDistance = Point.DistanceSquared(left, end);
        let rightDistance = Point.DistanceSquared(right, end);

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
