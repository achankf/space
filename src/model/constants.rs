use std::f32::consts::PI;
use wasm_bindgen::prelude::wasm_bindgen;

pub const TWO_PI: f32 = 2.0 * PI;
pub const ANGLE_CHANGE: f32 = 0.001;
pub const TICKS_PER_SECOND: u32 = 10;

pub const CITY_CIRCLE_RADIUS: f32 = 1. / 3.;
pub const CITY_DIST: f32 = 10.;
pub const CITY_DIST_OFFSET: f32 = CITY_DIST / 2.;
pub const EDGE_MAX_CITY_DIST: f32 = 2.5 * CITY_DIST;

pub const CITY_RADIUS_LIMIT: f32 = CITY_DIST / 5.;

pub const PLANET_CITY_STEP_SIZE: f32 = MIN_PLANET_RADIUS / 0.5;
pub const MIN_PLANET_RADIUS: f32 = 5.;
pub const MAX_PLANET_RADIUS: f32 = 30.;
pub const MIN_STAR_RADIUS: f32 = 20.;
pub const MAX_STAR_RADIUS: f32 = 40.;
pub const NUM_STAR_ORBITS: usize = 10;
pub const MIN_STARS_PER_ORBIT: usize = 4;
pub const MAX_STARS_PER_ORBIT: usize = 10;
pub const MIN_PLANETS_PER_SYSTEM: usize = 4;
pub const MAX_PLANETS_PER_SYSTEM: usize = 10;
pub const MIN_DIST_BETWEEN_PLANETS: f32 = 5. * MAX_PLANET_RADIUS + MAX_STAR_RADIUS;
pub const MAX_DIST_BETWEEN_PLANETS: f32 = 2. * MIN_DIST_BETWEEN_PLANETS;
pub const MAX_SYSTEM_RADIUS: f32 = MAX_PLANETS_PER_SYSTEM as f32 * MAX_DIST_BETWEEN_PLANETS;
pub const NUM_PLANET_ESTIMATE: usize = (NUM_STAR_ORBITS * NUM_STAR_ORBITS * 10) as usize;

// any objects' should be less than RADIUS_OF_LARGEST_OBJ, otherwise search functions won't work
pub const RADIUS_OF_LARGEST_OBJ: f32 = MAX_STAR_RADIUS;
pub const RADIUS_OF_LARGEST_OBJ_SQUARED: f32 = RADIUS_OF_LARGEST_OBJ * RADIUS_OF_LARGEST_OBJ;

#[wasm_bindgen]
pub fn get_planet_vertex_dist() -> f32 {
    CITY_DIST
}

#[wasm_bindgen]
pub fn get_ticks_per_second() -> u32 {
    TICKS_PER_SECOND
}

#[wasm_bindgen]
pub fn get_city_circle_radius() -> f32 {
    CITY_CIRCLE_RADIUS
}
