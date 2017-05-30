// TODO: Potentially remove pfCollisionLayer -- stare at everthing but floor instead, combine results
// TODO: We need to combine arrays, but not duplicate items. Might not be an issue if nothing lives on
// multiple layers -- e.g. Life is always Life, Block is always BLock, and we just check properties.
// Should be OK. If we kill pfCollisionLayer, we can have dynamic movement blocking without
// membership!

class ANode {
    position: Point;
    // parent: ANode;
    f: number = 0; // heuristic cost estimate (g+h)
    g: number = 0; // cost (g)
    readonly isWalkable: boolean;

    constructor(x: number, y: number, isWalkable: boolean) {
        this.position = new Point(x, y);
        this.isWalkable = isWalkable;
    }
}

// http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
class AStar {
    constructor() {
        let map = [ [0,1,1,1,1], // Sample map
                    [0,0,1,1,1],
                    [1,0,0,0,1],
                    [1,0,1,0,1],
                    [1,0,1,0,1] ];

        let width = map[0].length;
        let height = map.length;

        let start = new Point(0, 0);
        let goal = new Point(3, 4);

        let nodes = [];
        for (let y = 0; y < map.length; y++) {
            nodes[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                nodes[y][x] = new ANode(x, y, map[y][x] == 0);
            }
        }

        let open: ANode[] = [];
        let closed: ANode[] = [];

        let path: ANode[] = []; // Final path.

        let origin = new ANode(start.x, start.y, true);
        origin.g = 0;
        origin.f = origin.g + this.heuristicManhattan(start, goal); // http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#S7;
        open.push(origin);

        while (open.length != 0) {
            let node = this.popLowestScoreNode(open);

            if (node.position.equals(goal)) {
                // done; break
                break;
            }

            open.splice(open.indexOf(node), 1);
            closed.push(node);

            let adjacentPoints = this.getAdjacent(node, width, height);
            for (let p of adjacentPoints) {
                let next: ANode = nodes[p.y][p.x];
                // next.parent = node;

                /* this part added by me */
                if (!next.isWalkable) { // Isn't walkable (TODO: combine with closed check. potentially we can just deal with one array, with undefined/open/closed states)
                    closed.push(node);
                    continue;
                }
                /* this part added by me */

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

                // Best path until now
                next.g = tentativeG;
                next.f = next.g + this.heuristicManhattan(next.position, goal);
                path.push(node);
            }

            closed.push(node);
        }
    }

    popLowestScoreNode(nodes: ANode[]) : ANode {
        let bestIndex = 0;

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].f < nodes[bestIndex].f) {
                bestIndex = i;
            }
        }

        let bestNode = nodes[bestIndex];
        nodes.splice(bestIndex, 1);
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

    debugPrintMap(map: number[][]) {

    }

    debugPrintMapWithNodes(map: number[][], nodes: ANode[]) {

    }
}