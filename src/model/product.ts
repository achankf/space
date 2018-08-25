export enum Product {

    // raw materials
    Crop, // to food, chemical (seasonal high-yield harvest)
    Metal, // to vehicles, machines, weapons
    Gem, // to accessory, weapons
    Fuel, // fuel for spacecraft, power plant

    // intermediate
    Fiber, // to apparels, from crops
    Chemical, // to medicines & hulls, from any raw materials
    Circuit, // to gadgets, computers, from metals
    Computer, // from circuits

    // common goods
    Food, // generic food, from animals or crops
    Drink, // from crops
    Apparel, // from fibers
    Medicine, // from chemicals

    // luxuary
    Accessory, // from gems
    Furniture, // from fiber
    Gadget, // from computers
    Vehicle, // from metals

    // operational
    // Concrete, // construction, from metal
    Machine, // from metal and computers, used by industries
    Tool, // from metal, used for raw material production
    /*
    Supply, // from common goods

    // spacecraft component points
    Hull, // from metals & chemicals
    Laser, // from metals & gems
    Gun, // from metals & gems
    Missile, // from metals & gems
    Engine, // from metals & gems
    Shield, // from gems
    Armor, // from metals
    Countermeasure, // from metals

    // solder equipments
    Rifle, // from metals
    Uniform, // from fibers
    Saber, // from metals & gems; think light saber
    Exoskeleton, // from chemicals & fibers
    */
}

const productKeys = Object
    .keys(Product)
    .filter((k) => typeof Product[k as any] === "number");
const productValues = productKeys
    .map((k) => Number(Product[k as any]) as Product)
    .sort((a, b) => a - b);

export const NUM_PRODUCTS = productKeys.length;

export function allProducts() {
    return productValues.slice();
}

const DEMAND_PRODUCTS = new Map<Product, Array<Set<Product>>>([
    [Product.Crop, []],
    [Product.Metal, []],
    [Product.Gem, []],
    [Product.Fuel, []],
    [Product.Food, [new Set([Product.Crop])]],
    [Product.Drink, [new Set([Product.Crop])]],
    [Product.Apparel, [new Set([Product.Fiber])]],
    [Product.Medicine, [new Set([Product.Chemical])]],
    [Product.Fiber, [new Set([Product.Crop])]],
    [Product.Chemical, [new Set([
        Product.Crop,
        Product.Metal,
        Product.Gem,
        Product.Fuel,
    ])]],
    [Product.Circuit, [new Set([Product.Metal])]],
    [Product.Computer, [new Set([Product.Circuit])]],
    [Product.Accessory, [new Set([Product.Gem])]],
    [Product.Furniture, [new Set([Product.Fiber])]],
    [Product.Gadget, [new Set([Product.Computer])]],
    [Product.Vehicle, [new Set([Product.Metal])]],
    [Product.Machine, [
        new Set([Product.Metal]),
        new Set([Product.Computer]),
    ]],
    [Product.Tool, [new Set([Product.Metal])]],
]);

export function getInputProducts(product: Product) {
    return DEMAND_PRODUCTS.get(product)!;
}

// sanity checks
console.assert(allProducts().every((x) => getInputProducts(x) !== undefined));
