import { BiMap, Vec2D } from "myalgo-ts";
import { Hash2DFactor, IGalaxy, IPlanet, IStar, IZone } from "./def";
import { getColony } from "./getter";
import { calOrbitCoor, calStarOrbitCoor } from "./orbit";
import { allProducts, Product } from "./product";

export function createInitialState() {

    const ret: IGalaxy = {
        account: new Map(),
        cachedLocIdx: new Map(),
        colonyGovs: new Map(),
        corps: new Map(),
        locs: new Map(),
        nations: new Map(),
        orbitAngles: new Map(),
        people: new Map(),
        planetColonyMap: new BiMap(),
        planets: new Map(),
        stars: new Map(),
        stock: new Map(),
        storages: new Map(),
        tick: 0,
        zones: new Map(),
    };

    return ret;
}

export function getMass(galaxy: IGalaxy, symbol: symbol) {
    const ret = galaxy.planets.get(symbol) || galaxy.stars.get(symbol)!;
    console.assert(ret !== undefined);
    return ret;
}

export function calCoorHash([x, y]: Vec2D): Vec2D {
    // truncate coordinates to nearest integer; should be good enough (TODO?)
    return [Math.floor(x), Math.floor(y)];
}

const TWO_PI = 2 * Math.PI;
const ANGLE_CHANGE = 0.001;

function calNextAngle(prevState: Readonly<IGalaxy>, id: symbol, obj: IStar | IPlanet) {
    const angle = prevState.orbitAngles.get(id)!;
    console.assert(angle !== undefined);
    const radius = obj.orbitDist;

    // TODO? https://en.wikipedia.org/wiki/Orbit
    const change = ANGLE_CHANGE * 1 / Math.pow(radius, 2); // futher away, the slower it revolves
    const ret = (angle + change) % TWO_PI;
    console.assert(Number.isFinite(ret));
    return ret;
}

export function calTrue2DHash(x: number, y: number) {
    return cal2DHash(x / Hash2DFactor, y / Hash2DFactor);
}

export function cal2DHash(x: number, y: number) {

    const ix = Math.floor(x);
    const iy = Math.floor(y);

    // tslint:disable-next-line:no-bitwise
    return (ix << 16) + iy;

    // each dimension has up 2^15 bits before collision; support positive and negative numbers
}

function calLocIdx(galaxy: IGalaxy) {

    const ret = new Map<number, Set<symbol>>();

    for (const [id, [x, y]] of galaxy.locs) {
        const hash = cal2DHash(x / Hash2DFactor, y / Hash2DFactor);
        let set = ret.get(hash);
        if (set === undefined) {
            set = new Set();
            ret.set(hash, set);
        }
        set.add(id);
    }

    return ret;
}

function calMovement(galaxy: IGalaxy) {
    for (const [id, data] of galaxy.stars) {
        const angle = calNextAngle(galaxy, id, data);
        galaxy.orbitAngles.set(id, angle);

        const newCoor = calStarOrbitCoor(data.orbitDist, angle);
        galaxy.locs.set(id, newCoor);
    }

    for (const [id, data] of galaxy.planets) {
        const angle = calNextAngle(galaxy, id, data);
        galaxy.orbitAngles.set(id, angle);

        const newCoor = calOrbitCoor(galaxy, data.center, data.orbitDist, angle);
        galaxy.locs.set(id, newCoor);
    }

    galaxy.cachedLocIdx.clear();
    galaxy.cachedLocIdx = calLocIdx(galaxy);

    return galaxy;
}

function calCivilianDemand(zoneData: IZone): number[] {
    const pop = zoneData.pop;
    const ret = [];

    ret[Product.Food] = pop;
    ret[Product.Drink] = pop;
    ret[Product.Apparel] = pop;
    ret[Product.Medicine] = pop;

    return ret;
}

function getZonePrice(galaxy: IGalaxy, colonyId: symbol) {
    const colonyStorage = galaxy.storages.get(colonyId) || [];
    allProducts().map(() => 1);
    return allProducts().map(() => 1);
}

function calTradeColonyToZones(galaxy: IGalaxy) {
    for (const colonyId of galaxy.colonyGovs.keys()) {
        const colonyStorage = galaxy.storages.get(colonyId) || [];
        const colony = getColony(galaxy, colonyId);

        const zoneArr = Array.from(colony.zones);
        const mappedZones = zoneArr
            .map((zoneId): [symbol, number[]] => {
                const zoneData = galaxy.zones.get(zoneId)!;
                console.assert(zoneData !== undefined);
                return [zoneId, calCivilianDemand(zoneData)];
            });

        const prices = getZonePrice(galaxy, colonyId);

        const consumed = new Map(zoneArr.map((zoneId): [symbol, number[]] => [zoneId, []]));

        NEXT_PRODUCT: for (const product of allProducts()) {
            let supply = colonyStorage[product] || 0;
            console.assert(supply >= 0);

            const price = prices[product];
            console.assert(price > 0);

            for (const [zoneId, zoneDemand] of mappedZones) {

                console.assert(supply >= 0);
                if (supply === 0) {
                    continue NEXT_PRODUCT;
                }

                const demand = zoneDemand[product] || 0;

                if (demand === 0) {
                    continue;
                }
                console.assert(demand >= 0);

                const saving = galaxy.account.get(zoneId) || 0;
                const buyLimit = Math.floor(saving / price);

                const bought = Math.min(buyLimit, demand, supply);

                if (bought === 0) {
                    continue;
                }

                const con = consumed.get(zoneId)!;
                console.assert(con !== undefined);
                con[product] = bought;

                const cost = price * bought;
                galaxy.account.set(zoneId, saving - cost);

                const colonyBalance = galaxy.account.get(colonyId) || 0;
                galaxy.account.set(colonyId, colonyBalance + cost);

                supply -= bought;
            }
        }

        for (const [zoneId, qtys] of consumed) {
            // TODO calculate consumption rating
        }
    }
    return galaxy;
}

function calColonyIndustryDemand(galaxy: IGalaxy) {
    //
}

function calIndustryDemand(galaxy: IGalaxy) {
    for (const [planetId, planet] of galaxy.planets) {
        for (const [factionId, distribution] of planet.industryDistribution) {
            //
        }
    }
}

function calTradeColonyToIndustries(galaxy: IGalaxy) {
    return galaxy;
}

function calTradeCorpToColony(galaxy: IGalaxy) {
    return galaxy;
}

function calTrade(galaxy: IGalaxy) {

    let nextState = galaxy;

    // TODO maybe turn the following functions pure functions
    nextState = calTradeColonyToZones(nextState);
    nextState = calTradeColonyToIndustries(nextState);
    nextState = calTradeCorpToColony(nextState);

    return nextState;
}

function calWage(galaxy: IGalaxy) {

    /*
    const industryPts = new Map<symbol, number>(); // faction -> amount $

    for (const [zoneId, zoneData] of galaxy.zones) {
        for (const [corpId, indPts] of zoneData.industryPts) {
            const cur = industryPts.get(corpId) || 0;
            const wage = indPts; // TODO
            industryPts.set(corpId, cur + wage);
        }
    }
    */

    return galaxy;
}

function calProduction(galaxy: IGalaxy) {
    return galaxy;
}

function calIndustry(galaxy: IGalaxy) {

    let nextState = galaxy;

    nextState = calWage(nextState);
    nextState = calProduction(nextState);

    return galaxy;
}

function calRnD(galaxy: IGalaxy) {
    return galaxy;
}

function calInterest(galaxy: IGalaxy) {
    return galaxy;
}

export function calNextState(galaxy: IGalaxy): IGalaxy {

    /*
    for every tick
        move everything
        cal battles
        generate random events

    for every turn (multiples of ticks)
        apply interest
        resolve pending issues
        cal R&D
        cal trade (ship, industry)
        cal industry production (fill storage and sell the rest)
    */

    let nextState: IGalaxy = {
        ...galaxy,
        tick: galaxy.tick + 1,
    };

    nextState = calInterest(nextState);
    nextState = calRnD(nextState);
    nextState = calMovement(nextState);
    nextState = calTrade(nextState);
    nextState = calIndustry(nextState);

    return nextState;
}
