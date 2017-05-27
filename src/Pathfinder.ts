class Pathfinder {
    static findPath(matrix: number[][], startPosition: Point, endPosition: Point) : Point[] {
        let width = matrix[0].length; // assume x/y size is correct when matrix was built.
        let height = matrix.length;

        let grid = new PF.Grid(width, height, matrix); // NOTE: There seems to be a bug if we don't pass in the width/height, that the height won't be set.
        let astar = new PF.AStarFinder();

        grid.setWalkableAt(startPosition.x, startPosition.y, true); // Set start and end positions as walkable, so we can actually path to it
        grid.setWalkableAt(endPosition.x, endPosition.y, true);

        let path = astar.findPath(startPosition.x, startPosition.y, endPosition.x, endPosition.y, grid);

        let points: Point[] = [];
        for (let p of path) {
            points.push(new Point(p[0], p[1]));
        }

        return points;
    }

    static findNextNode(matrix: number[][], startPosition: Point, endPosition: Point) : Point {
        let path = this.findPath(matrix, startPosition, endPosition);
        return path.length == 1 ? path[0] : path[1]; // Shouldn't happen, but just in case.
    }
}