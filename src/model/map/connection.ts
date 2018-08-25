
/*
function unitNeighbours(x: number, y: number) {
    return [
        [x, y - 1], // top
        [x, y + 1], // bottom
        [x - 1, y], // left
        [x + 1, y], // right,
    ];
}

function diagNeighbours(x: number, y: number) {
    return [
        [x - 1, y - 1], // top-left
        [x + 1, y - 1], // top-right
        [x - 1, y + 1], // bottom-left
        [x + 1, y + 1], // bottom-right
    ];
}

export function getNeighbours(map: IMap, i: number) {
    const { width, height } = map;
    const [x, y] = fromIdx(map, i);
    return unitNeighbours(x, y)
        .filter(([x1, y1]) =>
            x1 >= 0 &&
            x1 < width &&
            y1 >= 0 &&
            y1 < height);
}

export function getDiagNeighbours(map: IMap, i: number) {
    const { width, height } = map;
    const [x, y] = fromIdx(map, i);
    return unitNeighbours(x, y)
        .concat(diagNeighbours(x, y))
        .filter(([x1, y1]) =>
            x1 >= 0 &&
            x1 < width &&
            y1 >= 0 &&
            y1 < height);
}

export function getNeighbourIdx(map: IMap, i: number) {
    return getNeighbours(map, i)
        .map(([x, y]) => toIdx(map, x, y));
}

export function getNeighbourIdxSet(map: IMap, i: number) {
    return new Set(getNeighbourIdx(map, i));
}

function makeConnection(map: IMap): AdjacencyList<number> {
    const { width, height, terrains } = map;
    const graph: AdjacencyList<number> = new Map();
    const dim = width * height;
    for (let i = 0; i < dim; i++) {
        const neighbourCoors = getNeighbours(map, i);

        if (!isLand(terrains[i])) {
            graph.set(i, []);
        } else {
            const neighbourIdx = neighbourCoors
                .map(([tx, ty]) => toIdx(map, tx, ty))
                .filter((j) => {
                    return isLand(terrains[j]);
                });
            graph.set(i, neighbourIdx);
        }
    }
    return new Map(graph);
}

function identifyContinents(map: IMap) {
    const { width, height, terrains } = map;
    const dim = width * height;

    const ret = new UnionFind<number>();
    for (let i = 0; i < dim; i++) {

        if (ret.has(i)) {
            continue;
        }

        const curIsLand = isLand(terrains[i]);

        const neighbours = bfsPreOrder(
            i,
            (idx) => {
                return getNeighbours(map, idx)
                    .map(([x, y]) => toIdx(map, x, y))
                    .filter((tileIdx) => curIsLand === isLand(terrains[tileIdx]))
                    .values();
            },
        );

        ret.union(i, ...neighbours.map(([u]) => u));
    }
    console.assert(ret.size === dim);
    return ret;
}

export function makeMapCache(map: IMap): IMapCache {
    return {
        connect: makeConnection(map),
        continents: identifyContinents(map),
    };
}
*/
