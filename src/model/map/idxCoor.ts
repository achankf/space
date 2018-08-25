import { Vec2D } from "myalgo-ts";
import { IPlanet } from "../def";

export function toIdx(state: Readonly<IPlanet>, x: number, y: number) {
    return y * state.width + x;
}

export function fromIdx(state: Readonly<IPlanet>, idx: number): Vec2D {
    const x = idx % state.width;
    const y = Math.floor(idx / state.width);
    return [x, y];
}
