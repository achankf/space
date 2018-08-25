import { BiMap, Vec2D } from "myalgo-ts";

export interface IZone {

    housing: number;
    pop: number; // max pop determined by zone kind

    industryPts: Map<symbol, number>; // faction id -> value

    // factors that affect development
    eduLvl: number; // education level
    healthLvl: number; // health level
    happyLvl: number; // happiness level
    safetyLvl: number; // safety level
    infrLvl: number; // infrastructure level
    energyLvl: number; // infrastructure level
}

export interface IPeople {
    name: string;
    job?: Job;
}

export interface IStorage {
    storage: number[]; // Product enum as index
    minKeep: number[]; // Product enum as index
}

export interface IGalaxy {
    account: Map<symbol, number>; // (faction|zone|personal) -> balance
    cachedLocIdx: Map<number, Set<symbol>>;
    colonyGovs: Map<symbol, IColony>; // id -> colony
    planetColonyMap: BiMap<symbol, symbol>; // planet <-> colony
    corps: Map<symbol, ICorporation>;
    locs: Map<symbol, Vec2D>; // any object that is located in the galaxy -> coordinates
    nations: Map<symbol, INational>;
    orbitAngles: Map<symbol, number>; // angle of the satellite (assuming circular), in radian
    people: Map<symbol, IPeople>;
    planets: Map<symbol, IPlanet>;
    stars: Map<symbol, IStar>;
    stock: Map<symbol, Map<symbol, number>>; // corp id -> person/faction id -> number shares
    storages: Map<symbol, number[]>; // colony id -> Product enum index -> qty
    tick: number;
    zones: Map<symbol, IZone>;
}

export enum FactionKind {
    Corporate,
    Colonial,
    National,
    // TODO Pirate,
}

export interface ICorporation {
    kind: FactionKind.Corporate;
    issuedShare: number;
    name: string;
    opRights: Set<symbol>; // operating rights: local governments ids
}

export const enum NationalPolicy {
}

export const enum ColonialPolicy {
}

export interface INational { // government
    kind: FactionKind.National;
    colGov: Set<symbol>;
    name: string;
    policies: Set<NationalPolicy>; // TODO use a bit set
    taxRate: number;
}

export interface IColony { // government
    kind: FactionKind.Colonial;
    allegiance: symbol; // nation id
    policies: Set<ColonialPolicy>; // TODO use a bit set
    taxRate: number;
    locatedSrc: symbol; // planet id or station id
    zones: Set<symbol>;
}

export const enum MassKind {
    Star,
    Planet,
    Station,
    Spaceport,
}

export interface IOrbital {
    orbitDist: number;
    center: symbol;
}

export interface IStar {
    name: string;
    massKind: MassKind.Star;
    radius: number;
    orbitDist: number;
}

export interface IStation extends IOrbital {
    name: string;
    massKind: MassKind.Station;
    height: number;
    width: number;
    radius: number;
    owner: symbol;
    storage: symbol;
}

export interface IPlanet extends IOrbital {
    name: string;
    massKind: MassKind.Planet;
    radius: number;
    height: number;
    width: number;
    zones: symbol[];
    marketingBudget: Map<symbol, number>;
    donationBudget: Map<symbol, number>;
    industryDistribution: Map<symbol, number[]>; // faction id -> product -> distribution of industrial capacity in [0,1]
    industryPts: Map<symbol, number[]>;
}

export enum Job {
    CEO,
    HeadOfColony,
    HeadOfPlanet,
    HeadOfState,
    FieldMarshall,
    General,
    Worker,
}

export const Hash2DFactor = 20;
