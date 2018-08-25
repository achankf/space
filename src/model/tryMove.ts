
/*
export function tryMove(game: Readonly<Game>, personId: symbol, destination: number): Partial<Game> {
    const unit = game.units.get(personId)!;
    console.assert(unit !== undefined);

    const location = game.unitLocation.getLeft(personId)!;
    console.assert(location !== undefined);

    if (location === destination) {
        return {}; // no need to move
    }

    const search = findPath(game, location, destination);

    if (search === undefined) {
        return {};
    }

    const { parent } = search;
    const path = extractPath(parent, location, destination);

    if (path === undefined) {
        return {}; // no path
    }

    console.assert(path.length > 1); // the source must be part of the path, and at least 1 more node for the destination

    const baseStats = getBaseStats(unit.race);
    const usedMp = game.movementUsed.get(personId) || 0;
    const movement = baseStats.movement;
    console.assert(movement >= 0);
    const remainingMp = movement - usedMp;

    let furthest = path.pop()!; // get rid of the source
    let furthestCost = 0;
    let tempCost = 0;

    // walk the path one by one, with true movement cost
    for (const idx of path.reverse()) {

        const cost = 1;
        console.assert(cost !== undefined);
        tempCost += cost;

        if (tempCost > remainingMp) {
            break;
        }

        // check if unit is walking into enemy's ZOC, break if that's the case
        if (getNeighbourIdx(game, idx)
            .some((t) => hasEnemyUnit(game, unit, t))) {

            // move only if tile is empty
            if (!game.unitLocation.has(idx)) {
                furthest = idx;
                furthestCost = remainingMp; // use up all movements to charge into enemy ZOC
            }
            break;
        }

        // advance if tile doesn't have any unit
        if (!game.unitLocation.has(idx)) {
            furthest = idx;
            furthestCost = tempCost;
        }
    }

    // update coordinates
    const isDeleted = game.unitLocation.deleteRight(personId);
    console.assert(isDeleted);
    console.assert(!game.unitLocation.has(furthest));
    const unitLocation = game.unitLocation.set(furthest, personId);

    const moved = usedMp + furthestCost;
    console.assert(moved <= baseStats.movement);

    return {
        movementUsed: game.movementUsed.set(personId, moved),
        unitLocation,
    };
}
*/
