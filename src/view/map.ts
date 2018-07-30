import { aStar, extractPath, genBy, manhattanDistance } from "myalgo-ts";
import { fromIdx, Game, IMap, isLand, Terrain, toIdx } from "../model/game";
import { Subject } from "../observer";

function groupBy<T, U>(it: Iterable<T>, keyFn: (t: T) => U) {
    const ret = new Map<U, Set<T>>();
    for (const t of it) {
        const key = keyFn(t);
        let set = ret.get(key);
        if (set === undefined) {
            set = new Set();
            ret.set(key, set);
        }
        set.add(t);
    }
    return ret;
}

function getTerrainColor(terrain: Terrain) {
    switch (terrain) {
        case Terrain.Grassland:
            return "green";
        case Terrain.ShallowWater:
            return "blue";
        case Terrain.Arctic:
            return "white";
        default:
            throw new Error("not handled");
    }
}

export interface IViewData {
    selected?: Symbol;
    hoveredTile?: number; // tileIdx
}

export class MapView {

    public readonly element = document.createElement("canvas");
    private gridSize = 20;

    constructor(
        private gameSubject: Subject<Game>,
        private viewDataSubject: Subject<IViewData>,
    ) {

        const canvas = this.element;

        canvas.onclick = (e) => {
            const x = Math.floor(e.offsetX / this.gridSize);
            const y = Math.floor(e.offsetY / this.gridSize);

            const game = gameSubject.prevState;
            const viewData = viewDataSubject.prevState;

            if (viewData.selected === undefined) {
                const idx = toIdx(game, x, y);
                viewDataSubject.nextState = {
                    ...viewData,
                    selected: game.peopleLocation.get(idx),
                };
            } else {
                const idx = toIdx(game, x, y);
                viewDataSubject.nextState = {
                    ...viewData,
                    hoveredTile: idx === viewData.hoveredTile ? undefined : idx,
                };
            }
        }
    }

    public startRenderLoop() {
        const loop = () => {
            this.update()
            requestAnimationFrame(loop);
        }
        loop();
    }

    public update() {
        const game = this.gameSubject.prevState;
        const viewData = this.viewDataSubject.prevState;

        const canvas = this.element;
        const gridSize = this.gridSize;
        console.assert(game.terrains.length === game.width * game.height);

        canvas.width = game.width * gridSize;
        canvas.height = game.height * gridSize;

        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.strokeRect(0, 0, canvas.width - 1, canvas.height - 1);

        const dimension = game.height * game.width;
        const range = genBy((idx) => idx).take(dimension);
        const terrainGroup = groupBy(range, (idx) => game.terrains[idx]);

        for (const [terrain, idxs] of terrainGroup) {
            ctx.save();

            ctx.fillStyle = getTerrainColor(terrain);

            for (const idx of idxs) {
                const [x, y] = fromIdx(game, idx);
                const vpX = x * gridSize;
                const vpY = y * gridSize;
                ctx.fillRect(vpX, vpY, gridSize, gridSize);
            }

            ctx.restore();
        }


        let path: Map<number, number>;
        let arr: number[];
        if (viewData.selected !== undefined && viewData.hoveredTile !== undefined) {
            const from = game.peopleLocation.getLeft(viewData.selected)!;
            const to = viewData.hoveredTile;
            path = findPath(game, game.connect, from, to);
            arr = extractPath(path, from, to) || [];
        } else {
            path = new Map();
            arr = [];
        }
        console.log(arr.map((x) => [x, fromIdx(game, x).join()]));
        const set = new Set(arr);
        console.assert(set.size === arr.length);

        for (const idx of path.keys()) {
            ctx.save();

            ctx.fillStyle = "yellow";

            const [x, y] = fromIdx(game, idx);
            const vpX = (x + 0.5) * gridSize;
            const vpY = (y + 0.5) * gridSize;

            if (set.has(idx)) {
                ctx.save();

                ctx.restore();
            }
            ctx.fillText("C", vpX, vpY);

            ctx.restore();
        }
        for (const idx of set) {
            ctx.save();

            ctx.fillStyle = "black";

            const [x, y] = fromIdx(game, idx);
            const vpX = (x + 0.5) * gridSize;
            const vpY = (y + 0.5) * gridSize;
            console.assert(isLand(game.terrains[idx]));
            ctx.fillText(`C`, vpX, vpY);
            ctx.restore();
        }

        ctx.save();
        ctx.font = `${gridSize * 5 / 6}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const idx of game.centers) {
            const [x, y] = fromIdx(game, idx);
            const vpX = (x + 0.5) * gridSize;
            const vpY = (y + 0.5) * gridSize;
            ctx.fillText("A", vpX, vpY);
        }
        ctx.restore();

        ctx.save();
        ctx.font = `${gridSize * 5 / 6}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const [idx] of game.peopleLocation) {
            const [x, y] = fromIdx(game, idx);
            const vpX = (x + 0.5) * gridSize;
            const vpY = (y + 0.5) * gridSize;
            ctx.fillText("p", vpX, vpY);
        }
        ctx.restore();

        for (let i = 0; i < game.width; i++) {
            ctx.beginPath();
            const x = i * gridSize;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let i = 0; i < game.height; i++) {
            ctx.beginPath();
            const y = i * gridSize;
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function weight1(terrain: Terrain) {
    switch (terrain) {
        case Terrain.ShallowWater:
            console.assert(false);
            return 1;
        case Terrain.Grassland:
            return 1;
        case Terrain.Arctic:
            return 2;
        default:
            throw new Error("not handled");
    }
}

function findPath(
    map: IMap,
    graph: Map<number, number[]>,
    from: number,
    to: number,
) {
    return aStar(
        graph,
        (u, v) => weight1(map.terrains[u]) + weight1(map.terrains[v]),
        from,
        to,
        (u, v) => 2.5 * manhattanDistance(fromIdx(map, u), fromIdx(map, v)),
    );
}
