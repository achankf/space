
/** Determine whether tile has an enemy unit, relative to myUnit */

/*
export function hasEnemyUnit(game: Game, myUnit: IUnit, tileIdx: number) {
    const targetId = game.unitLocation.get(tileIdx);
    if (targetId !== undefined) {
        const target = game.units.get(targetId)!;
        console.assert(target !== undefined);

        if (target.isEnemy !== myUnit.isEnemy) {
            return true; // one unit per tile
        }
    }
    return false;
}

export function findPath(game: Game, source: number, destination: number) {

    const unitId = game.unitLocation.get(source)!;
    console.assert(unitId !== undefined);
    const unit = game.units.get(unitId)!;
    console.assert(unit !== undefined);

    const baseStats = getBaseStats(unit.race);
    const zocCost = baseStats.movement;

    function weightFn(_: number, v: number) {

        if (v !== destination && hasEnemyUnit(game, unit, v)) {
            return Infinity; // cannot move into enemy
        }

        if (getNeighbourIdx(game, v)
            .some((t) => hasEnemyUnit(game, unit, t))) {
            return zocCost;
        }

        return 1; // uniform weight
    }

    function heuristic(u: number, v: number) {
        const [x1, y1] = fromIdx(game, u);
        const [x2, y2] = fromIdx(game, v);
        const dx = x2 - x1;
        const dy = y2 - y1;
        return 2 * Math.sqrt(dx * dx + dy * dy);
    }

    if (!game.continents.isSameSet(source, destination)) {
        // TODO maybe allow ships later
        return undefined;
    }

    return aStarAdjList(
        game.connect,
        weightFn,
        source,
        heuristic,
        destination);
}
*/
