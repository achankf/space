/** Warning: I am not a physicist */

import { makePair } from "myalgo-ts";
import { IGalaxy } from "./def";

export function calStarOrbitCoor(orbitDist: number, angle: number) {
    return calOrbitCoorHelper(0, 0, orbitDist, angle);
}

export function calOrbitCoor(state: IGalaxy, center: symbol, orbitDist: number, angle: number) {

    const baseCoor = state.locs.get(center)!;
    console.assert(baseCoor !== undefined);
    const [baseX, baseY] = baseCoor;

    return calOrbitCoorHelper(baseX, baseY, orbitDist, angle);
}

function calOrbitCoorHelper(centerX: number, centerY: number, orbitDist: number, angle: number) {

    const xDist = orbitDist * Math.cos(angle);
    const yDist = orbitDist * Math.sin(angle);

    const x = centerX + xDist;
    const y = centerY + yDist;
    return makePair(x, y);
}
