import { shuffleSlice } from "myalgo-ts";
import { FactionKind, IGalaxy, IZone, MassKind } from "./model/def";
import { createInitialState } from "./model/galaxy";
import { calOrbitCoor, calStarOrbitCoor } from "./model/orbit";

const TWO_PI = 2 * Math.PI;

export function createGame(): IGalaxy {

    let tempStarNameGen = 0;
    function addStar(galaxy: IGalaxy, orbitDist: number, angle: number) {
        const id = Symbol();
        galaxy.stars.set(id, {
            massKind: MassKind.Star,
            name: `Star ${tempStarNameGen}`,
            orbitDist,
            radius: 1,
        });
        ++tempStarNameGen;

        galaxy.orbitAngles.set(id, angle);
        galaxy.locs.set(id, calStarOrbitCoor(orbitDist, angle));
        return id;
    }

    let tempPlanetNameGen = 1;
    function addPlanet(galaxy: IGalaxy, center: symbol, orbitDist: number) {

        const star = galaxy.stars.get(center)!;
        console.assert(star !== undefined);

        const width = 30;
        const height = 30;
        const dim = width * height;

        const zonesData = Array.from({ length: dim }, (): IZone => ({
            eduLvl: 0,
            energyLvl: 0,
            happyLvl: 0,
            healthLvl: 0,
            housing: 0,
            industryPts: new Map(),
            infrLvl: 0,
            pop: Math.random() * 1000,
            safetyLvl: 0,
        }));

        const zones: symbol[] = [];
        zonesData.forEach((zone, i) => {
            const zoneId = Symbol();
            galaxy.zones.set(zoneId, zone);
            zones[i] = zoneId;
        });

        const id = Symbol();
        galaxy.planets.set(id, {
            center,
            donationBudget: new Map(),
            height,
            industryDistribution: new Map(),
            industryPts: new Map(),
            marketingBudget: new Map(),
            massKind: MassKind.Planet,
            name: `${star.name}-${toRomanNum(tempPlanetNameGen)}`, // TODO
            orbitDist,
            radius: 0.3,
            width,
            zones,
        });
        ++tempPlanetNameGen;

        const angle = Math.random() * TWO_PI;
        galaxy.orbitAngles.set(id, angle);

        galaxy.locs.set(id, calOrbitCoor(galaxy, center, orbitDist, angle));

        return id;
    }

    const state = createInitialState();

    const numStarOrbits = 20;
    for (let i = 0; i < numStarOrbits; i++) {

        const start = Math.random() * TWO_PI;
        const orbitDist = i * 200 + 100;

        const numStars = Math.ceil(
            Math.pow(Math.max(i, Math.random() * (i + 4)), 1.3)
            + 1);

        const parts = TWO_PI / numStars;

        let prevStarDist = start;
        for (let j = 0; j < numStars; j++) {
            const star1Id = addStar(state, orbitDist, prevStarDist);
            prevStarDist += parts;

            const numPlanets = Math.floor(Math.random() * 8 + 2);

            let prevPlanetDist = Math.random() * 2 + 2;
            tempPlanetNameGen = 1;
            for (let k = 0; k < numPlanets; k++) {
                prevPlanetDist += Math.random() * 2 + 2;
                addPlanet(state, star1Id, prevPlanetDist);
            }
        }
    }

    let nationGen = 1;
    const colonizeFactor = 0.2;
    const numColonized = state.planets.size * colonizeFactor;
    shuffleSlice(state.planets)
        .take(numColonized)
        .forEach(([planetId, planetData]) => {

            const nationId = Symbol();
            const capitalGovId = Symbol();

            // create nation
            state.nations.set(nationId, {
                colGov: new Set(),
                kind: FactionKind.National,
                name: `Nation ${nationGen++}`,
                policies: new Set(),
                taxRate: 0,
            });

            // create capital
            state.colonyGovs.set(capitalGovId, {
                allegiance: nationId,
                kind: FactionKind.Colonial,
                locatedSrc: planetId,
                policies: new Set(),
                taxRate: 0,
                zones: new Set(),
            });

            state.planetColonyMap.set(planetId, capitalGovId);
        });

    return state;
}

function toRomanNum(num: number): string {
    switch (num) {
        case 1:
            return "I";
        case 2:
            return "II";
        case 3:
            return "III";
        case 4:
            return toRomanNum(1) + toRomanNum(5);
        case 5:
            return "V";
        case 6:
            return toRomanNum(5) + toRomanNum(1);
        case 7:
            return toRomanNum(5) + toRomanNum(2);
        case 8:
            return toRomanNum(5) + toRomanNum(3);
        case 9:
            return toRomanNum(1) + toRomanNum(10);
        case 10:
            return "X";
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
            {
                const d1 = 20 - num;
                return toRomanNum(10) + toRomanNum(d1);
            }
        default:
            throw new Error("not handled");
    }
}
