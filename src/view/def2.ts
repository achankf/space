import { SpacecraftKind } from "../../galaxy";

export interface IDrawStarData {
    name: string;
    radius: number;
    x: number;
    y: number;
}

export interface IDrawPlanetData {
    name: string;
    radius: number;
    x: number;
    y: number;
    cx: number;
    cy: number;
}

export interface IDrawShipData {
    kind: SpacecraftKind;
    radius: number;
    x: number;
    y: number;
}

export interface IDrawGalaxyData {
    planets: IDrawPlanetData[];
    stars: IDrawStarData[];
    ships: IDrawShipData[];
}
