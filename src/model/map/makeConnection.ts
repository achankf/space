import { AdjacencyList } from "myalgo-ts";
import { fromIdx2, IMap, isLand, toIdx2 } from "../game";

export function makeConnection({ width, height, terrains }: IMap): AdjacencyList<number> {

    const isValidCoor = ([x, y]: [number, number]) =>
        x >= 0 && x < width
        && y >= 0 && y < height;

    const graph: Array<[number, number[]]> = [];
    const dim = width * height;
    for (let i = 0; i < dim; i++) {
        const [x, y] = fromIdx2(width, i);
        const neighbourCoors: [number, number][] = [
            [x, y - 1], // top
            [x, y + 1], // bottom
            [x - 1, y], // left
            [x + 1, y], // right
        ]

        if (!isLand(terrains[i])) {
            graph.push([i, []]);
        } else {
            const neighbourIdx = neighbourCoors
                .filter(isValidCoor)
                .map(([tx, ty]) => toIdx2(width, tx, ty))
                .filter((j) => {
                    return isLand(terrains[j]);
                });
            graph.push([i, neighbourIdx]);
        }
    }
    return new Map(graph);
}
