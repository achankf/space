use std::collections::HashSet;
use std::ops::{Index, IndexMut};
use City;
use CityId;
use Galaxy;
use PlanetId;
use PlanetVertexId;
use Product;
use SortedEdge;

impl City {
    pub fn new() -> Self {
        City {
            population: 0,
            consumption_lvl: 0.,
            education_lvl: 0.,
            health_lvl: 0.,
            happy_lvl: 0.,
            safety_lvl: 0.,
            infrastructure_lvl: 0.,
            energy_lvl: 0.,
            telecom_lvl: 0.,
            influence: Default::default(),
            market: Default::default(),
            industry: [(Product::Food, 0)], // TODO
            custom_industry: [None],
            owner: None,
            controller: None,
        }
    }
}
