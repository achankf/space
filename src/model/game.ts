import { aStar, BiMap, defaultZero, extractPath, shuffleSlice, UnionFind } from "myalgo-ts";
import { makeConnection } from "./map/makeConnection";

export enum Terrain {
    Grassland,
    ShallowWater,
    Arctic,
}

export function isLand(terrain: Terrain) {
    switch (terrain) {
        case Terrain.Grassland:
        case Terrain.Arctic:
            return true;
        default:
            return false;
    }
}

export interface IPerson {
    id: Symbol,
    // attributes

    // hidden attributes
}

export enum BuildingKind {
    Village,
    Suburb,
    Dungeon,
}

export interface IMap {
    width: number,
    height: number,
    terrains: Terrain[],
}

export interface IMapCache {
    connect: Map<number, number[]>,
}

enum CommodityKind {
    Food
}

enum ArtifactKind {
    Sword,
}

interface IArtifact {
    id: Symbol,
    kind: ArtifactKind,
}

enum DamageKind {
    Blade,
    Pierce,
    Impact,
    Arcane,
    Fire,
    Cold,
}

enum TargetKind {
    MeleeSingle,
}

interface IAttackMove {
    damageKind: Set<DamageKind>;
    baseDamage: number;
    targetKind: TargetKind;
    baseHit: number; // hit chance, ranging from 0 to 1
    speed: number;
}

enum UnitEffectKind {
    BonusBladeAtk,
}

interface IBonusBladeAtkEffect {
    kind: UnitEffectKind.BonusBladeAtk;
    value: number;
}

type UnitEffect = IBonusBladeAtkEffect;

interface ISkill {
    prerequisites: Set<Symbol>; // set of IPromotion ids
    effects: UnitEffect[];
}

interface IUnitTemplate {
    name: string;
    hp: number;
    baseAtk: Map<DamageKind, number>;
    baseDef: Map<DamageKind, number>;
    speed: number;
    atkMoves: Set<Symbol>; // id of IAttack
    baseEffects: UnitEffect[];
    movement: number,
    movementCost: Map<Terrain, number>,
}

enum VictoryCondition {
    Regicide,
    Assassination,
    Defense,
    Marathon,
}

export interface IGameRule {
    attackMoves: Map<Symbol, IAttackMove>;
    skills: Map<Symbol, ISkill>;
    unitTemplates: Map<Symbol, IUnitTemplate>;
}

export enum Gender {
    Male,
    Female,
    None,
}

export interface IUnit {
    name: string;
    gender: Gender;
    experience: number;
    template: Symbol; // id of IUnitTemplate
    promotions: Set<Symbol>; // set of promotion ids
}

export interface IPeople {
    people: Map<Symbol, IUnit>;
    peopleLocation: BiMap<number, Symbol>; // tile idx -> person
    teamLeaders: Set<Symbol>; // set of peopld ids
    teamMembers: UnionFind<Symbol>; // Symbol -> People
    movementUsed: Map<Symbol, number>; // people id -> #movement points used
}

export interface ICorporation {
    id: Symbol;
    shareHolders: Map<Symbol, number>; // person | corporation -> number of shares
    realEstates: Set<Symbol>; // set of IBuilding ids
}

export interface IBuilding {
    id: Symbol;
    kind: BuildingKind;
}

export interface IWorld {
    centers: Set<number>;
    inhabitants: Map<number, Set<Symbol>>;  // set of people
    cityInventory: Map<number, Symbol>; // location -> inventory symbol
    buildings: Map<Symbol, IBuilding>; // id -> data
    buildingLocations: Map<number, Symbol>; // tile idx -> building id
    corporations: Map<Symbol, ICorporation>; // id -> data
}

export interface IItems {
    inventory: Map<Symbol, Map<CommodityKind, number>>, // person id -> commodity -> quantity
    artifacts: Map<Symbol, IArtifact>, // artifact id -> artifact data
    artifactOwner: Map<Symbol, Set<Symbol>>, // person -> artifacts
    equipped: Map<Symbol, Set<Symbol>>, // person -> artifacts
}

export interface IAction {
    pathQueue: Map<Symbol, number[]>;
}

export type Game = IMap & IWorld & IPeople & IItems & IMapCache & IGameRule;

export function createInitialState(
    map: IMap,
): Game {

    const lands = map.terrains
        .map((terrain, idx): [number, number] => [terrain, idx])
        .filter(([terrain]) => terrain === Terrain.Grassland)
        .map(([, idx]) => idx);

    const numInitVillage = 10;

    const centers = new Set(shuffleSlice(lands).take(numInitVillage));

    const people: IPeople = {
        people: new Map(),
        peopleLocation: new BiMap(),
        teamMembers: new UnionFind(),
        teamLeaders: new Set(),
        movementUsed: new Map(),
    };

    const items: IItems = {
        inventory: new Map(),
        artifacts: new Map(),
        artifactOwner: new Map(),
        equipped: new Map(),
    };

    const world: IWorld = {
        centers,
        inhabitants: new Map(),
        cityInventory: new Map(),
        buildings: new Map(),
        buildingLocations: new Map(),
        corporations: new Map(),
    }

    const mapCache: IMapCache = {
        connect: makeConnection(map),
    }

    const commonerId = Symbol();
    const gameRule: IGameRule = {
        attackMoves: new Map(),
        skills: new Map(),
        unitTemplates: new Map([
            [commonerId,
                {
                    name: "Commoner",
                    hp: 100,
                    baseAtk: new Map(),
                    baseDef: new Map(),
                    speed: 10,
                    atkMoves: new Set(),
                    baseEffects: [],
                    movement: 5,
                    movementCost: new Map([
                        [Terrain.Arctic, 2],
                        [Terrain.Grassland, 1],
                        [Terrain.ShallowWater, 1],
                    ]),
                }
            ]
        ]),
    }

    const game: Game = {
        ...map,
        ...world,
        ...people,
        ...items,
        ...mapCache,
        ...gameRule,
    }

    const playerId = Symbol();

    const unit: IUnit = {
        name: "James",
        gender: Gender.Male,
        experience: 0,
        template: commonerId,
        promotions: new Set(),
    }

    return {
        ...game,
        people: game.people.set(playerId, unit),
        teamLeaders: game.teamLeaders.add(playerId),
        teamMembers: game.teamMembers.union(playerId),
        peopleLocation: game.peopleLocation.set(1, playerId),
    };
}

export function calNextState(prevState: Readonly<Game>) {



    return {
        ...prevState,
    };
}

const weightFn = (game: Game, movementCost: Map<Terrain, number>) => (_: number, v: number) => {
    if (game.peopleLocation.has(v)) {
        return Infinity; // one unit per tile
    }
    const cost = movementCost.get(game.terrains[v])!;
    console.assert(cost !== undefined, "all terrain must have a movement cost");
    return cost;
}

export function tryMove(game: Game, personId: Symbol, destination: number) {
    const person = game.people.get(personId)!;
    console.assert(person !== undefined);

    const location = game.peopleLocation.getLeft(personId)!;
    console.assert(location !== undefined);

    const unitTemplate = game.unitTemplates.get(person.template)!;
    console.assert(unitTemplate !== undefined);

    const search = aStar(game.connect, weightFn(game, unitTemplate.movementCost), location);
    const path = extractPath(search, location, destination);

    if (path === undefined) {
        return; // no path
    }

    let usedMP = defaultZero(game.movementUsed.get(personId));
    for (const idx of path) {
        const terrain = game.terrains[idx];
        const cost = unitTemplate.movementCost.get(terrain)!;
    }

    const movement = unitTemplate.movement;
}

export function toIdx(state: Readonly<IMap>, x: number, y: number) {
    return y * state.width + x;
}

export function toIdx2(width: number, x: number, y: number) {
    return y * width + x;
}

export function fromIdx(state: Readonly<IMap>, idx: number): [number, number] {
    const x = idx % state.width;
    const y = Math.floor(idx / state.width);
    return [x, y];
}

export function fromIdx2(width: number, idx: number): [number, number] {
    const x = idx % width;
    const y = Math.floor(idx / width);
    return [x, y];
}
