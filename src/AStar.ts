class ANode {
    position: Point;
    parent: ANode;
    f: number = 0; // heuristic cost estimate (g+h)
    g: number = 0; // cost (g)
    readonly isWalkable: boolean;

    constructor(x: number, y: number, isWalkable: boolean) {
        this.position = new Point(x, y);
        this.isWalkable = isWalkable;
    }
}

class AStar {
    constructor() {
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

        console.log('start:' + new Date().getTime());

        let width = map[0].length;
        let height = map.length;

        let start = new Point(0, 0);
        let goal = new Point(3, 10);

        let nodes: ANode[][] = [];
        for (let y = 0; y < map.length; y++) {
            nodes[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                nodes[y][x] = new ANode(x, y, map[y][x] == 0);
            }
        }

        let open: ANode[] = [];
        let closed: ANode[] = [];

        let origin = new ANode(start.x, start.y, true);
        origin.g = 0;
        origin.f = origin.g + this.heuristicManhattan(start, goal); // http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#S7;
        open.push(origin);

        while (open.length != 0) {
            console.log('open count:' + open.length);
            let node = this.popLowestScoreNode(open);

            console.log('lowest score node:' + node.position.x + ',' + node.position.y);

            if (node.position.equals(goal)) {
                // done; break
                console.log('path made');
                let path = this.reconstructPath(nodes, node);
                this.debugPrintSolvedMap(map, path);

                console.log('end:' + new Date().getTime());
                break;
            }

            closed.push(node);

            let adjacentPoints = this.getAdjacent(node, width, height);

            for (let p of adjacentPoints) {
                let next: ANode = nodes[p.y][p.x];

                console.log('- neighbour:' + p.x + ',' + p.y);

                /* this part below by me */
                if (!next.isWalkable) { // Isn't walkable (TODO: combine with closed check. potentially we can just deal with one array, with undefined/open/closed states)
                    // closed.push(node);
                    console.log('-- not walkable; done');
                    continue;
                }
                /* this part above by me */

                if (closed.indexOf(next) > -1) { // Is closed
                    console.log('-- is closed; done');
                    continue;
                }

                let tentativeG = node.g + Point.distance(node.position, next.position);

                if (open.indexOf(next) == -1) { // Add if not in open set
                    if (next.position.x == 1 && next.position.y == 4) {
                        let anotherdebug = true;
                    }
                    console.log('-- not open; adding to open')
                    open.push(next);
                }
                else if (tentativeG >= next.g) { // Already open...
                    console.log('-- already open, poor score; done');
                    continue; // but wasn't a better path
                }

                // Best path at this time
                console.log('-- BEST');

                next.g = tentativeG;
                next.f = next.g + this.heuristicManhattan(next.position, goal);
                next.parent = node;
            }
        }

        // TODO: Return failure
    }

    // TODO: This needs reversal
    reconstructPath(nodes: ANode[][], current: ANode) : ANode[] {
        let path = [];
        path.push(current);

        while (current.parent != null) {
            path.push(current.parent);
            current = current.parent;
        }

        return path;
    }

    popLowestScoreNode(open: ANode[]) : ANode {
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

    getAdjacent(node: ANode, width: number, height: number) : Point[] {
        let neighbours: Point[] = [];

        // Assumes u/d/l/r
        let directions: Point[] = [];
        directions.push(new Point(0, 1));
        directions.push(new Point(0, -1));
        directions.push(new Point(1, 0));
        directions.push(new Point(-1, 0));

        for (let d of directions) {
            let p = Point.add(node.position, d);

            // Point is in bounds
            let inBounds = false;
            if ((p.x >= 0 && p.x < width) && (p.y >= 0 && p.y < height)) {
                inBounds = true;
            }

            if (inBounds) {
                neighbours.push(p);
            }
        }

        return neighbours;
    }

    heuristicManhattan(node: Point, goal: Point) : number { // Good for 4 directions
        let D = 1;
        let dx = Math.abs(node.x - goal.x);
        let dy = Math.abs(node.y - goal.y);
        return D * (dx + dy);
    }

    debugPrintSolvedMap(map: number[][], path: ANode[]) {
        let solved = [];

        for (let y = 0; y < map.length; y++) {
            solved[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                solved[y][x] = map[y][x] == 0 ? ' ' : '#';
            }
        }

        for (let p of path) {
            solved[p.position.y][p.position.x] = 'o';
        }

        for (let y = 0; y < solved.length; y++) {
            let line = '';
            for (let x = 0; x <solved[y].length; x++) {
                line += solved[y][x];
            }
            console.log(line + '\n');
        }
    }
}