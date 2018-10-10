use cal_star_orbit_coor;
use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use wbg_rand::{wasm_rng, Rng, WasmRng};
use AccessRight;
use City;
use CityId;
use ColonyHost;
use ColonyId;
use Corporation;
use EnumMap;
use FactionData;
use Foreign;
use Galaxy;
use Locatable;
use Nation;
use NationId;
use Orbit;
use Planet;
use PlanetId;
use PlanetVertexId;
use Product;
use Star;
use StarId;
use StationedDivisions;
use TWO_PI;

const NUM_STAR_ORBITS: usize = 10;
const NUM_PLANET_ESTIMATE: usize = (NUM_STAR_ORBITS * NUM_STAR_ORBITS * 10) as usize;

#[wasm_bindgen]
impl Galaxy {
    pub fn new() -> Self {
        let mut rng = wasm_rng();
        Self::generate_galaxy(&mut rng)
            .generate_factions(&mut rng)
            .update_mappings()
            .update_locs()
    }

    pub fn interop_colonize(&mut self, nation_idx: u16, planet_idx: u16, vertex_idx: u8) {
        let planet_id = PlanetId::new(self, planet_idx);
        let vertex_id = PlanetVertexId::new(self, planet_id, vertex_idx);
        let nation_id = NationId::new(self, nation_idx);
        self.colonize(nation_id, vertex_id);
    }
}

impl Galaxy {
    pub fn colonize(&mut self, nation_id: NationId, vertex_id: PlanetVertexId) {
        if !self.try_colonize(nation_id, vertex_id) {
            unimplemented!("not handled");
        }
    }

    pub fn try_colonize(&mut self, nation_id: NationId, vertex_id: PlanetVertexId) -> bool {
        let PlanetVertexId { planet_id, .. } = vertex_id;

        let PlanetId(planet_idx) = planet_id;
        let CityId(city_idx) = vertex_id.to_city_id(self);
        let city = &mut self.cities[city_idx as usize];
        if city.owner.is_some() || city.controller.is_some() {
            return false;
        }

        let planet = &self.planets[planet_idx as usize];

        if let Locatable::Star(star_id) = planet.orbit.center {
            use log;
            log(&format!(
                "{:?} (System: {:?}) is colonizing {} (vertex: {:?}, colony: {})",
                nation_id, star_id, planet.name, vertex_id, city_idx
            ));
        } else {
            unreachable!(
                "{:?} is not revolving around a star, got {:?}",
                planet_id, planet.orbit.center
            );
        }

        city.owner = Some(nation_id);
        city.controller = Some(nation_id);
        return true;
    }

    fn update_mappings(mut self) -> Self {
        {
            use std::u8::MAX;
            let num_cities = self.cities.len();

            // insert dummy data for random access later
            self.city_idx_to_vertex_id = vec![
                PlanetVertexId {
                    planet_id: PlanetId(0),
                    vertex_idx: MAX,
                };
                num_cities
            ];

            for (planet_idx, planet) in self.planets.iter().enumerate() {
                for i in 0..planet.cal_dimension() {
                    let CityId(city_idx) = self.vertex_idx_to_city_id[planet_idx][i as usize];
                    let vertex_id =
                        PlanetVertexId::new(&self, PlanetId(planet_idx as u16), i as u8);
                    let entry = &mut self.city_idx_to_vertex_id[city_idx as usize];
                    let PlanetVertexId { vertex_idx, .. } = entry.clone();
                    assert!(vertex_idx == MAX);
                    *entry = vertex_id;
                }
            }
        }
        self
    }

    fn generate_galaxy(rng: &mut WasmRng) -> Self {
        let mut ret = Galaxy {
            stars: Vec::with_capacity(NUM_STAR_ORBITS),
            planets: Vec::with_capacity(NUM_PLANET_ESTIMATE),
            angles: HashMap::with_capacity(NUM_PLANET_ESTIMATE),
            locs: HashMap::with_capacity(NUM_PLANET_ESTIMATE),
            loc_idx: HashMap::with_capacity(NUM_PLANET_ESTIMATE),
            stationed_divisions: StationedDivisions(Vec::with_capacity(NUM_PLANET_ESTIMATE)),
            ..Self::default()
        };
        let mut star_id_gen = 1;

        for i in 0..NUM_STAR_ORBITS {
            let r = rng.gen::<f32>();
            let start = r * TWO_PI;
            let orbit_radius = (i * 50 + 10) as f32;
            let c1 = i as f32;
            let r = rng.gen::<f32>();
            let c2 = r * (c1 + 4.0);
            let num_stars = (c1.max(c2) + 1.0).ceil() as i32;
            let parts = TWO_PI / (num_stars as f32);

            let mut prev_star_angle = start;

            for _ in 0..num_stars {
                let star_idx = ret.stars.len();
                let star_name = format!("Star {0}", star_id_gen);
                ret.stars.push(Star {
                    name: star_name.clone(),
                    radius: 0.4,
                    orbit_radius,
                });
                star_id_gen += 1;
                ret.angles
                    .insert(Locatable::Star(StarId(star_idx as u16)), prev_star_angle);

                //  addStar(state, orbitDist, prevStarDist);
                prev_star_angle += parts;

                let r = rng.gen::<f32>();
                let num_planets = (r * 8.0 + 2.0).floor() as i32;
                let r = rng.gen::<f32>();
                let mut prev_planet_radius = r * 0.5 + 0.5;
                let mut temp_planet_name_gen = 1;

                for _ in 0..num_planets {
                    let planet_idx = ret.planets.len();
                    let r = rng.gen::<f32>();
                    prev_planet_radius += r * 0.5 + 0.5;

                    let radius = 0.3;
                    let orbit = Orbit {
                        orbit_radius: prev_planet_radius,
                        center: Locatable::Star(StarId(star_idx as u16)),
                        radius,
                    };
                    let name = format!("{0} Planet {1}", star_name, temp_planet_name_gen);
                    let planet = Planet::new(rng, name, orbit);
                    let dim = planet.cal_dimension();

                    ret.planets.push(planet);
                    temp_planet_name_gen += 1;

                    let angle = rng.gen::<f32>() * TWO_PI;
                    ret.angles
                        .insert(Locatable::Planet(PlanetId(planet_idx as u16)), angle);

                    let StationedDivisions(stationed_divisions_data) = &mut ret.stationed_divisions;
                    stationed_divisions_data.push(vec![Default::default(); dim as usize]);

                    // create city vertices
                    let mut city_mapping = Vec::with_capacity(dim as usize);
                    for _ in 0..dim {
                        let city_id = CityId(ret.cities.len() as u16);
                        ret.cities.push(City::new());
                        city_mapping.push(city_id);
                    }

                    ret.vertex_idx_to_city_id.push(city_mapping);
                }
            }
        }

        ret
    }

    fn generate_factions(mut self, rng: &mut WasmRng) -> Self {
        let num_planets = self.planets.len();
        let colony_factor = 0.1;
        let num_nations = ((num_planets as f32 * colony_factor) as usize).max(1);

        let planet_ids = {
            let mut planet_ids: Vec<_> = (0..self.planets.len()).collect();
            rng.shuffle(&mut planet_ids);
            planet_ids
        };

        assert!(self.planets.len() > 0);
        let planet_ids = vec![0]; // TODO

        for i in 1..=num_nations {
            self.nations.push(Nation {
                name: format!("nation {}", i),
                colonies: HashSet::default(),
                faction: FactionData::default(),
                prev_discuss_date: 0,
                topics: Default::default(),
                leader: None,
                political_parties: Default::default(),
                foreign: vec![
                    Foreign {
                        relation: 0,
                        access: AccessRight::None,
                    };
                    num_nations
                ],
                wars: Default::default(),
                income_tax: 0.0,
                inheritance_tax: 0.0,
                import_tariffs: Default::default(),
                export_tariffs: Default::default(),
                power: 0,
                labor: 0,
                stability: 0,
                war_support: 0,
                corruption: 0,
                culture: 0,
                freedom: 0,
                ownership: 0,
                trade: 0,
                tradition: 0,
            });
        }

        // debug
        {
            let nation_id0 = NationId::new(&self, 0);
            let nation_id1 = NationId::new(&self, 1);
            let nation_id2 = NationId::new(&self, 2);
            let planet_idx = 0;
            let planet_id = PlanetId::new(&self, planet_idx as u16);

            for i in 1..9 {
                let vertex_id = PlanetVertexId::new(&self, planet_id, i);
                self.try_colonize(nation_id2, vertex_id);
            }

            let vertex_id = PlanetVertexId::new(&self, planet_id, 9);
            self.try_colonize(nation_id0, vertex_id);

            let vertex_id = PlanetVertexId::new(&self, planet_id, 10);
            self.try_colonize(nation_id1, vertex_id);

            for i in 11..30 {
                let vertex_id = PlanetVertexId::new(&self, planet_id, i);
                self.try_colonize(nation_id2, vertex_id);
            }
        }

        let num_planets = self.planets.len();
        for i in 0..num_nations {
            loop {
                let nation_id = NationId::new(&self, i as u16);
                let planet_idx = rng.gen_range(0, num_planets);
                let planet_id = PlanetId::new(&self, planet_idx as u16);
                let planet_dim = self.planets[planet_idx].cal_dimension();
                let vertex_idx = rng.gen_range(0, planet_dim);
                let vertex_id = PlanetVertexId::new(&self, planet_id, vertex_idx);

                if self.try_colonize(nation_id, vertex_id) {
                    break;
                }
            }
        }

        self
    }

    /*
    pub fn cal_population(&self) -> f64 {
        let colony = &self.colonies[0];
        let planet = &self.planets[0];
    
        colony
            .get_controlled_tile_idxs()
            .iter()
            .map(|&tile_idx| planet.tiles.data[tile_idx].population)
            .sum()
    }
    
    pub fn get_neighbour_tiles(&self) -> BTreeMap<NationId, HashSet<usize>> {
        let colony = &self.colonies[0];
        let planet = &self.planets[0];
    
        colony
            .get_controlled_tile_idxs()
            .iter()
            .flat_map(|&idx| planet.get_neighbours_from_idx(idx))
            .filter(|&idx| !colony.controlled_tiles[idx])
            .fold(BTreeMap::default(), |mut acc, tile_idx| {
                let tile = &planet.tiles.data[tile_idx];
                if let Some(nation_id) = tile.controller {
                    acc.entry(nation_id).or_default().insert(tile_idx);
                }
                acc
            })
    }
    
    pub fn get_neighbour_countries(&self) -> HashSet<NationId> {
        let colony = &self.colonies[0];
        let planet = &self.planets[0];
    
        colony
            .get_controlled_tile_idxs()
            .iter()
            .flat_map(|&idx| planet.get_neighbours_from_idx(idx))
            .filter(|&idx| !colony.controlled_tiles[idx])
            .filter_map(|idx| {
                let tile = &planet.tiles.data[idx];
                tile.controller
            })
            .collect()
    }
    */
}
