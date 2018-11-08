use colony::Industry;
use colony::IndustrySector;
use enum_map::EnumMap;
use product::Product;
use std::collections::HashMap;
use std::fmt;
use std::ops::{Index, IndexMut};

lazy_static! {

    /// a table for the # of input materials required in order to produce 1 unit of good
    static ref BASE_DEMANDS: EnumMap<Product, HashMap<Product, u32>> = enum_map!{
        Product::Food => Default::default(),
        _ => Default::default(),
    };
}

impl Index<Product> for Industry {
    type Output = IndustrySector;

    fn index(&self, product: Product) -> &Self::Output {
        let Self(data) = self;
        &data[product]
    }
}

impl IndexMut<Product> for Industry {
    fn index_mut<'a>(&'a mut self, product: Product) -> &'a mut Self::Output {
        let Self(data) = self;
        &mut data[product]
    }
}

impl Industry {
    fn cal_potential_production(&self, product: Product) -> u32 {
        BASE_DEMANDS[product]
            .iter()
            .map(|(&product, &demand_per_unit)| {
                assert!(demand_per_unit > 0);
                let in_stock_qty = self[product].storage_qty;
                in_stock_qty / demand_per_unit
            })
            .min()
            .unwrap_or_default()
    }

    fn cal_real_production(&self) -> HashMap<Product, u32> {
        self.cal_production_capacity()
            .into_iter()
            .map(|(product, production_capacity)| {
                let potential_production = self.cal_potential_production(product);
                let qty = production_capacity.min(potential_production);
                (product, qty)
            })
            .filter(|&(_, qty)| qty > 0)
            .collect()
    }

    pub fn run_production_cycle(&mut self) {
        for (produce_product, produce_qty) in self
            .cal_real_production()
            .into_iter()
            .filter(|&(_, produce_qty)| produce_qty > 0)
        {
            // consume input materials
            for (&input_product, &demand_per_unit) in &BASE_DEMANDS[produce_product] {
                self[input_product].consume_exact(produce_qty * demand_per_unit)
            }

            // then produce the item
            self[produce_product].produce(produce_qty);
        }
    }

    fn cal_production_capacity(&self) -> HashMap<Product, u32> {
        self.0
            .iter()
            .map(|(product, sector)| {
                let capacity = sector.scale;
                (product, capacity)
            })
            .filter(|&(_, capacity)| capacity > 0)
            .collect()
    }

    /// answers how much goods are needed to produce at maximum capacity
    pub fn cal_potential_production_demands(&self) -> EnumMap<Product, u32> {
        self.cal_production_capacity().into_iter().fold(
            EnumMap::default(),
            |mut acc, (product, production_capacity)| {
                for (demand_product, demand_unit_qty) in &BASE_DEMANDS[product] {
                    //
                    let potential_need = demand_unit_qty * production_capacity;
                    acc[*demand_product] += potential_need;
                }
                acc
            },
        )
    }
}

impl fmt::Display for Industry {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        fn sector_to_string((product, sector): (Product, &IndustrySector)) -> String {
            format!(
                "{:<3} {:<15} {}\n",
                product as u32,
                product.to_string(),
                sector,
            )
        }

        let header = format!(
            "Id  {:<15} {:>15} {:>15} {:>15} {:>15} {:>15} {:>15} {:>15}\n",
            "product",
            "scale",
            "#employees",
            "op eff.",
            "tech",
            "storage scale",
            "storage qty",
            "in-transport qty",
        );

        let ret = &self
            .0
            .iter()
            .map(sector_to_string)
            .fold(header, |mut acc, cur| {
                // aka "join"
                acc.push_str(&cur);
                acc
            });
        write!(f, "{}\n", ret)
    }
}
