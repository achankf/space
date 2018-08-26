extern crate wasm_bindgen;

use std::collections::HashMap;
use std::collections::HashSet;
use std::f32::consts::PI;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(msg: &str);

    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f64;
}

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

const TWO_PI: f32 = 2.0 * PI;

pub enum MassKind {
    Planet(Planet),
    Star(Star),
}

pub struct Planet {
    name: String,
    radius: f32,
    height: u16,
    width: u16,
    orbit_dist: f32,
    zones: HashSet<usize>,
}

pub struct Star {
    name: String,
    radius: f32,
    orbit_dist: f32,
}

pub struct IZone {
    housing: f32,
    pop: f32, // max pop determined by zone kind

/*
    industryPts: Map<symbol, number>; // faction id -> value

    // factors that affect development
    eduLvl: number; // education level
    healthLvl: number; // health level
    happyLvl: number; // happiness level
    safetyLvl: number; // safety level
    infrLvl: number; // infrastructure level
    energyLvl: number; // infrastructure level
    */
}

/*
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
*/

#[wasm_bindgen]
pub struct Galaxy {
    account: HashMap<u32, u32>,
    planets: Vec<Planet>,
    stars: Vec<Star>,
}

#[wasm_bindgen]
impl Galaxy {
    pub fn new() -> Self {
        let mut stars = vec![];
        let mut planets = vec![];

        let num_star_orbits = 20;
        for i in 0..num_star_orbits {
            let r = random() as f32;
            let start = r * TWO_PI;
            let orbit_dist = (i * 200 + 100) as f32;

            let c1 = i as f32;
            let r = random() as f32;
            let c2 = r * (c1 + 4.0);
            let num_stars = (c1.max(c2) + 1.0).ceil() as i32;

            let parts = TWO_PI / (num_stars as f32);

            let mut prev_star_dist = start;

            let mut star_id_gen = 1;
            for _ in 0..num_stars {
                stars.push(Star {
                    name: format!("Star {0}", star_id_gen),
                    orbit_dist,
                    radius: 1.0,
                });
                star_id_gen += 1;

                //  addStar(state, orbitDist, prevStarDist);
                prev_star_dist += parts;

                let r = random() as f32;
                let num_planets = (r * 8.0 + 2.0).floor() as i32;
                let r = random() as f32;
                let mut prev_planet_dist = r * 2.0 + 2.0;
                let mut temp_planet_name_gen = 1;

                for _ in 0..num_planets {
                    let r = random() as f32;
                    prev_planet_dist += r * 2.0 + 2.0;

                    let width = 30;
                    let height = 30;
                    let radius = 0.3;
                    planets.push(Planet {
                        name: format!("Planet {0}", temp_planet_name_gen),
                        height,
                        width,
                        radius,
                        orbit_dist: prev_planet_dist,
                        zones: HashSet::new(),
                    });
                    temp_planet_name_gen += 1;
                }
            }
        }

        Galaxy {
            account: HashMap::new(),
            planets,
            stars,
        }
    }

    pub fn print_planets(&self) {
        for planet in &self.planets {
            log!("{}", planet.name);
        }
    }
}

/*
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
*/
