/*
Doc:
    - Pass in a 2d array of coordinates, example:
          [ [0,0,0,0,0],
            [1,1,0,0,0],
            [0,0,0,0,1],
            [0,0,1,0,1],
            [0,0,0,0,0] ]
    - Provide the start and end, and the path will be returned.

Optimizations:
    - Methods to set individual cells walkable/unwalkable, rather than constantly rebuild the map.

Potential TODOs:
    - Untie from core Point(), as it is the only dependency on the rest of the engine.
    - Clean up console.log comments.
*/
class ANode {
    position: Point;
    parent: ANode;
    f: number = 0; // heuristic cost estimate (g+h)
    g: number = 0; // cost (g)

    constructor(x: number, y: number) {
        this.position = new Point(x, y);
    }
}

class AStarPathfinder {
    static findNextNode(matrix: number[][], start: Point, end: Point) : Point {
        let path = this.findPath(matrix, start, end);
        return path.length == 1 ? path[0] : path[1];
    }

    static findPath(map: number[][], start: Point, end: Point) : Point[] {
        let width = map[0].length;
        let height = map.length;

        let open: ANode[] = [];
        let closed: ANode[] = [];

        let nodes: ANode[][] = [];  // array of all nodes, pre-setting unpathable xy as being closed.
        for (let y = 0; y < map.length; y++) {
            nodes[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                nodes[y][x] = new ANode(x, y);

                let isOpen = map[y][x] == 0;
                if (!isOpen) {
                    closed.push(nodes[y][x]);
                }
            }
        }

        let origin = new ANode(start.x, start.y);
        origin.g = 0;
        origin.f = origin.g + this.heuristicManhattan(start, end); // http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#S7;
        open.push(origin);

        while (open.length != 0) {
            let node = this.popLowestScoreNode(open);

            if (node.position.equals(end)) { // done
                let path = this.reconstructPath(nodes, node);  // this.debugPrintSolvedMap(map, path);
                return path;
            }

            closed.push(node);

            let adjacentPoints = this.getAdjacent(node, width, height);

            for (let p of adjacentPoints) {
                let next: ANode = nodes[p.y][p.x];

                if (closed.indexOf(next) > -1) { // Is closed
                    continue;
                }

                let tentativeG = node.g + Point.distance(node.position, next.position);

                if (open.indexOf(next) == -1) { // Add if not in open set
                    open.push(next);
                }
                else if (tentativeG >= next.g) { // Already open...
                    continue; // but wasn't a better path
                }

                // Best path at this time
                next.g = tentativeG;
                next.f = next.g + this.heuristicManhattan(next.position, end);
                next.parent = node;
            }
        }

        return []; // fail, empty path.
    }

    private static reconstructPath(nodes: ANode[][], current: ANode) : Point[] {
        let path: Point[] = [];
        path.push(current.position);

        while (current.parent != null) {
            path.push(current.parent.position);
            current = current.parent;
        }

        return path.reverse(); // we worked backwards, so reverse it
    }

    private static popLowestScoreNode(open: ANode[]) : ANode {
        let bestIndex = 0;

        for (let i = 0; i < open.length; i++) {
            if (open[i].f < open[bestIndex].f) {
                bestIndex = i;
            }
        }

        let bestNode = open[bestIndex];
        open.splice(bestIndex, 1);
        return bestNode;
    }

    private static getAdjacent(node: ANode, width: number, height: number) : Point[] {
        let neighbours: Point[] = [];

        let directions: Point[] = []; // Assumes up/down/left/right
        directions.push(new Point(0, 1));
        directions.push(new Point(0, -1));
        directions.push(new Point(1, 0));
        directions.push(new Point(-1, 0));

        for (let d of directions) {
            let p = Point.add(node.position, d);

            // Point is in bounds
            if ((p.x >= 0 && p.x < width) && (p.y >= 0 && p.y < height)) {
                neighbours.push(p);
            }
        }

        return neighbours;
    }

    private static heuristicManhattan(node: Point, goal: Point) : number { // 4-direction heuristic
        let d = 1; // may want to tweak this depending on path prettiness
        let dx = Math.abs(node.x - goal.x);
        let dy = Math.abs(node.y - goal.y);
        return d * (dx + dy);
    }

    private static debugPrintSolvedMap(map: number[][], path: Point[]) {
        let solved = [];

        for (let y = 0; y < map.length; y++) {
            solved[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                solved[y][x] = map[y][x] == 0 ? ' ' : '#';
            }
        }

        for (let p of path) {
            solved[p.y][p.x] = 'o';
        }

        for (let y = 0; y < solved.length; y++) {
            let line = '';
            for (let x = 0; x <solved[y].length; x++) {
                line += solved[y][x];
            }
            console.log(line + '\n');
        }
    }

    private static debugGetTestMap() : number[][] {
        let map = [ [0,1,1,1,1], // Sample map
            [0,0,1,1,1],
            [1,0,0,0,1],
            [1,0,1,0,1],
            [1,0,1,0,1],
            [1,0,1,0,1],
            [1,0,1,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,1,1],
            [1,0,1,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1] ];

        return map;
    }
}