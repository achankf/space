import { IPlanetId } from "../model/def";

export const enum StateKind {
    NothingSelected, // initial state
    SelectedUnit,
}

export interface IAttackSelectedData {
    attackMoveId: symbol;
}

export const enum MessageKind {
    UnitMoved,
    CombatResult,
}

export interface IUnitMoved {
    kind: MessageKind.UnitMoved;
    unitId: symbol;
    from: number;
    to: number;
}

export interface ICombatResult {
    kind: MessageKind.CombatResult;
    attacker: symbol;
    defender: symbol;
    attackerLost: number;
    defenderLost: number;
}

export type Message =
    IUnitMoved |
    ICombatResult
    ;

export const enum TabKind {
    Galaxy,
    Planet,
    Search,
    Player,
    Nation,
    Station,
    People,
}

export interface IBaseTab {
    tabId: symbol;
}

export interface IPlanetTab extends IBaseTab {
    kind: TabKind.Planet;
    planetId: IPlanetId;
}

export interface IGalaxyTab extends IBaseTab {
    kind: TabKind.Galaxy;
}

export interface ISearchTab extends IBaseTab {
    kind: TabKind.Search;
}

export interface IPlayerTab extends IBaseTab {
    kind: TabKind.Player;
}

export interface INationTab extends IBaseTab {
    kind: TabKind.Nation;
}

export interface IStationTab extends IBaseTab {
    kind: TabKind.Station;
}

export interface IPeopleTab extends IBaseTab {
    kind: TabKind.People;
}

export type TabData =
    IGalaxyTab |
    IPlanetTab |
    ISearchTab |
    IPlayerTab |
    INationTab |
    IStationTab |
    IPeopleTab
    ;

export const MAX_GRID_SIZE = 40;
export const MIN_GRID_SIZE = 1;
export const MIN_SHOW_GRID_SIZE = 10;
export const BIG_GRID_FACTOR = 40;
export const TWO_PI = 2 * Math.PI;
