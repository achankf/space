
/*
const toTerrain = (width: number, height: number, noise: SimplexNoise) => (x: number, y: number) => {
    const val = noise.noise2D(x / width, y / height);
    console.assert(val >= -1 && val <= 1); // SimplexNoise.noise2D
    if (val < 0) {
        return Terrain.ShallowWater;
    } else {
        return Terrain.Grassland;
    }
};

export function createEastVsWestMap(
    width: number,
    height: number,
): IMap {
    const dimension = width * height;
    const terrains = new Array<Terrain>(dimension).fill(Terrain.Grassland);
    const map: IMap = {
        height,
        terrains,
        width,
    };

    const gen = toTerrain(width, height, new SimplexNoise());

    for (let i = 0; i < dimension; i++) {
        const [x, y] = fromIdx(map, i);
        terrains[i] = gen(x, y);
    }

    return map;
}
*/
