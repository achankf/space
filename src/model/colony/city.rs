use enum_map::EnumMap;
use product::ProductQty;
use std::collections::{HashMap, HashSet};
use std::fmt;
use City;
use Product;

impl City {
    pub fn new() -> Self {
        City {
            population: 10000,
            consumption_lvl: 0.,
            education_lvl: 0.,
            health_lvl: 0.,
            safety_lvl: 0.,
            infrastructure_lvl: 0.,
            energy_lvl: 0.,
            telecom_lvl: 0.,
            development: 0,
            facilities: Default::default(),
            facility_points: 0,
            num_facilities: 0,
            educated: 0,
            role_distribution: Default::default(),
            influence: Default::default(),
            owner: None,
            controller: None,
            industry: Default::default(),
            tech: Default::default(),
            transporters: Default::default(),
        }
    }

    // calculate how much goods should be held on to before reseller
    pub fn cal_min_hold_factor(&self) -> f32 {
        const MIN_FACTOR: f32 = 1.2;

        // TODO take techs and warehouses into consideration
        MIN_FACTOR
    }

    pub fn cal_trade_surplus(&self) -> EnumMap<Product, u32> {
        let min_hold_factor = self.cal_min_hold_factor();

        let mut ret = self.cal_total_projected_demands();

        for (demand_product, demand_qty) in &mut ret {
            //
            let min_hold_qty = ((*demand_qty as f32) * min_hold_factor) as u32;
            let in_stock_qty = self.industry[demand_product].storage_qty;

            *demand_qty = if in_stock_qty > min_hold_qty {
                in_stock_qty - min_hold_qty
            } else {
                0
            }
        }

        ret
    }

    pub fn update_economy(&mut self) {
        // industry consumption and production & civilian consumption
        {
            self.industry.run_production_cycle();

            let civilian_demands = self.cal_civilian_consumption_demands();

            for (product, sector) in &mut self.industry.0 {
                let demand_qty = civilian_demands[product];

                if demand_qty != 0 {
                    let consumed_qty = sector.try_consume(demand_qty) as f32;
                    let consumption_ratio = consumed_qty / (demand_qty as f32);
                }
            }

            // calculate consumption rating

            // TODO
        }

        // handle transporter grow and shrink
        {
            let transporter_cargo_size = self.cal_transporter_cargo_size();

            let total_transporters_needed: u32 = self
                .cal_trade_surplus()
                .into_iter()
                .filter(|(_, surplus_qty)| *surplus_qty > 0)
                .map(|(_, surplus_qty)| surplus_qty / transporter_cargo_size)
                .sum();

            // if there is a shortage of transports, try to queue up new transport construction
            // - potential transports = min(excess demand of neighbours, leftover surplus) / transporter_cargo_size
            // - real transports = min(potential, number of free construction lines)

            // TODO

            // if there is a surplus of transports, try to shrink the size

            // TODO
        }
    }

    pub fn cal_transporter_cargo_size(&self) -> u32 {
        // TODO apply city's tech level
        100
    }

    pub fn cal_civilian_consumption_demands(&self) -> EnumMap<Product, u32> {
        let mut ret = EnumMap::default();

        let population = self.population;
        ret[Product::Food] = population;
        ret[Product::Drink] = population;
        ret[Product::Apparel] = population;

        ret
    }

    pub fn cal_total_projected_demands(&self) -> EnumMap<Product, u32> {
        let mut ret = self.industry.cal_potential_production_demands();
        let civilian_demands = self.cal_civilian_consumption_demands();

        for (product, qty) in civilian_demands.into_iter() {
            ret[product] += qty;
        }

        ret
    }

    pub fn cal_demand_deficits(&self) -> EnumMap<Product, u32> {
        //
        let industry_demands = self.industry.cal_potential_production_demands();
        let civilian_demands = self.cal_civilian_consumption_demands();

        // gather products that have a demand
        let products: HashSet<_> = industry_demands
            .iter()
            .chain(civilian_demands.iter())
            .filter(|(_, qty)| **qty > 0)
            .map(|(product, _)| product)
            .collect(); // collect into a set to eliminate duplicates

        // calculate the deficits
        products
            .into_iter()
            .fold(EnumMap::default(), |mut acc, product| {
                let total_demands = industry_demands[product] + civilian_demands[product];
                let sector = &self.industry[product];
                let num_satisfied = sector.storage_qty + sector.in_transport_qty;

                if num_satisfied < total_demands {
                    acc[product] = total_demands - num_satisfied;
                }
                acc
            })
    }
}

impl fmt::Display for City {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "population: {}\n{}", self.population, self.industry)
    }
}
