import { IGalaxy } from "./def";

export function getPlanet(galaxy: IGalaxy, planetId: symbol) {
    const ret = galaxy.planets.get(planetId)!;
    console.assert(ret !== undefined);
    return ret;
}

export function getColony(galaxy: IGalaxy, colonyId: symbol) {
    const ret = galaxy.colonyGovs.get(colonyId)!;
    console.assert(ret !== undefined);
    return ret;
}
