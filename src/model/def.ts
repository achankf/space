import { get_ticks_per_second, Product } from "../../galaxy";

// types for interop with rust wasm, all readonly and actual data must be generated on the Rust side

export interface IPlanetId {
    readonly Planet: number;
}

export interface IStarId {
    readonly Star: number;
}

export interface INationId {
    readonly Nation: number;
}

export interface ICorporationId {
    readonly Corporation: number;
}

export interface ISpecialist {
    readonly Specialist: number;
}

export interface IColonyId {
    readonly Colony: {
        readonly planet_idx: number;
        readonly colony_idx: number;
    };
}

export type Id =
    Partial<
    IPlanetId &
    IStarId &
    INationId &
    ICorporationId &
    ISpecialist
    >;

export interface IPlanetInfo {
    readonly name: string;
    readonly width: number;
    readonly height: number;
}

export type Locatable = IPlanetId & IStarId;

export interface ISearchResult {
    readonly id: Locatable;
    readonly name: string;
}

export interface INameSearchResult {
    readonly id: Id;
    readonly name: string;
}

const TICKS_PER_SECOND = get_ticks_per_second();
export const TICK_PERIOD = 1000 / TICKS_PER_SECOND; // in milliseconds, used in setInterval()

const productValues = Object
    .keys(Product)
    .filter((k) => typeof Product[k as any] === "number")
    .map((k) => Number(Product[k as any]) as Product)
    .sort((a, b) => a - b);

export function allProducts() {
    return productValues.slice();
}

export function getProductName(product: Product) {
    switch (product) {
        case Product.Accessory: return "Accessory";
        case Product.Apparel: return "Apparel";
        case Product.Crop: return "Crop";
        case Product.Metal: return "Metal";
        case Product.Concrete: return "Concrete";
        case Product.Supply: return "Supply";
        case Product.Alloy: return "Alloy";
        case Product.Gem: return "Gem";
        case Product.Fuel: return "Fuel";
        case Product.Fiber: return "Fiber";
        case Product.Chemical: return "Chemical";
        case Product.Circuit: return "Circuit";
        case Product.Computer: return "Computer";
        case Product.Food: return "Food";
        case Product.Medicine: return "Medicine";
        case Product.Furniture: return "Furniture";
        case Product.Vehicle: return "Vehicle";
        case Product.Machine: return "Machine";
        case Product.Tool: return "Tool";
        case Product.Hull: return "Hull";
        case Product.Engine: return "Engine";
        case Product.Weapon: return "Weapon";
        case Product.Shield: return "Shield";
        case Product.Armor: return "Armor";
        case Product.Countermeasure: return "Countermeasure";
        case Product.Rifle: return "Rifle";
        case Product.Uniform: return "Uniform";
        case Product.Saber: return "Saber";
        case Product.Exoskeleton: return "Exoskeleton";
        default:
            throw new Error("not handled");
    }
}

try {
    allProducts().map((x) => getProductName(x));
} catch (e) {
    console.assert(false, "sanity check failed");
}
