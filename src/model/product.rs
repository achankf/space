use std::collections::HashMap;
use std::fmt;
use std::ops::Add;
use std::ops::Index;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Enum, Serialize, Deserialize)]
pub enum Product {
    // basic
    Crop,  // to chemical
    Metal, // to vehicles, machines, weapons
    Gem,   // to accessory, weapons
    Fuel,  // fuel for spacecraft, power plant

    // intermediate
    Alloy,    // from metal
    Fiber,    // from crop
    Chemical, // to medicine & hull, from crop
    Circuit,  // to gadget, computer, from alloy
    Concrete, // for construction

    // common goods
    Food,
    Drink,
    Apparel,   // from fiber
    Medicine,  // from chemical
    Computer,  // from circuit
    Accessory, // from gems
    Furniture, // from fiber
    Vehicle,   // from alloy

    // operational
    Machine, // from alloy and computers, used by industries
    Tool,    // from metal, used for raw material production

    // land warfare,
    Melee,
    Range,
    Artillery,
    Tank,
    PowerArmor,
    Logistics,
}

impl fmt::Display for Product {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Default)]
pub struct ProductQty(pub HashMap<Product, u32>);

impl Into<HashMap<Product, u32>> for ProductQty {
    fn into(self) -> HashMap<Product, u32> {
        self.0
    }
}

impl From<HashMap<Product, u32>> for ProductQty {
    fn from(data: HashMap<Product, u32>) -> Self {
        Self(data)
    }
}

impl ProductQty {
    pub fn new(data: HashMap<Product, u32>) -> Self {
        ProductQty(data)
    }
}

impl Index<Product> for ProductQty {
    type Output = u32;

    fn index(&self, product: Product) -> &Self::Output {
        &self.0[&product]
    }
}

impl Add for ProductQty {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        let ProductQty(a) = self;
        let ProductQty(b) = other;

        let mut ret = a.clone();

        for (product, qty) in b {
            //
            *ret.entry(product).or_default() += qty;
        }

        ProductQty(ret)
    }
}
