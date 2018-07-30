import { randomGenStrict } from "myalgo-ts";
import { IMap, Terrain } from "../game";

export function createEastVsWestMap(
    width: number,
    height: number,
): IMap {
    const dimension = width * height;
    const terrains = new Array<Terrain>(dimension).fill(Terrain.Grassland);
    const map: IMap = {
        width,
        height,
        terrains
    };

    // create the ocean in the center
    {
        const mid = Math.floor(width / 2);
        const half = Math.max(0, width / 2 - 1);
        let prevLeft!: number;
        let prevRight!: number;
        for (let i = 0; i < height; i++) {
            let left = Math.floor(Math.random() * half);
            let right = Math.floor(Math.random() * half);

            if (i > 0) {
                left = Math.floor((left + 3 * prevLeft) / 4); // weighted average, favoring the previous step's value (so that the river looks smooth)
                right = Math.floor((right + 3 * prevRight) / 4);
            }
            prevLeft = left;
            prevRight = right;

            const distApart = right - left + 1;

            const islandGen = randomGenStrict(Terrain.ShallowWater, new Map([[Terrain.Grassland, 0.1]]));

            for (let j = mid - left; j <= mid + right; j++) {
                const terrain = distApart > 3 ? islandGen() : Terrain.ShallowWater;
                map.terrains[i * width + j] = terrain;
            }
        }
    }

    // turn land near north & south poles to arctic
    {
        const minArticHeight = height / 12;
        const maxRandomHeight = height / 12;
        let prevNorth!: number;
        let prevSouth!: number;
        for (let x = 0; x < width; x++) {

            // north pole
            {
                let realHeight = minArticHeight + Math.floor(Math.random() * maxRandomHeight);

                if (x > 0) {
                    realHeight = (realHeight + 3 * prevNorth) / 4; // smoothing
                }
                prevNorth = realHeight;

                for (let y = 0; y < realHeight; y++) {
                    const idx = y * width + x;
                    if (map.terrains[idx] === Terrain.Grassland) {
                        map.terrains[idx] = Terrain.Arctic;
                    }
                }
            }

            // south pole
            {
                let realHeight = minArticHeight + Math.floor(Math.random() * maxRandomHeight);

                if (x > 0) {
                    realHeight = (realHeight + 3 * prevSouth) / 4; // smoothing
                }
                prevSouth = realHeight;

                for (let y = 0; y < realHeight; y++) {
                    const idx = (height - y - 1) * width + x;
                    if (map.terrains[idx] === Terrain.Grassland) {
                        map.terrains[idx] = Terrain.Arctic;
                    }
                }
            }
        }
    }

    console.assert(map.terrains.length === dimension);
    return map;
}
