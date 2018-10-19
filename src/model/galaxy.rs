use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::wasm_bindgen;
use wbg_rand::{wasm_rng, Rng};
use {
    AccessRight, City, CityId, FactionData, Foreign, Galaxy, Locatable, Nation, NationId, Orbit,
    Planet, PlanetId, PlanetVertexId, Star, StarId, StationedDivisions, VertexId, VertexToCityId,
    MAX_DIST_BETWEEN_PLANETS, MAX_PLANETS_PER_SYSTEM, MAX_PLANET_RADIUS, MAX_STARS_PER_ORBIT,
    MAX_STAR_RADIUS, MAX_SYSTEM_RADIUS, MIN_DIST_BETWEEN_PLANETS, MIN_PLANETS_PER_SYSTEM,
    MIN_PLANET_RADIUS, MIN_STARS_PER_ORBIT, MIN_STAR_RADIUS, NUM_PLANET_ESTIMATE, NUM_STAR_ORBITS,
    TWO_PI,
};

#[wasm_bindgen]
impl Galaxy {
    pub fn new() -> Self {
        let mut rng = wasm_rng();
        Self::generate_galaxy(&mut rng)
            .generate_factions(&mut rng)
            .update_mappings()
            .update_locs()
    }

    pub fn interop_colonize(&mut self, nation_idx: u16, planet_idx: u16, vertex_idx: usize) {
        let planet_id = PlanetId::new(self, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let vertex_id = PlanetVertexId::new(self, planet_id, vertex_id);
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
                    vertex_id: VertexId(MAX),
                };
                num_cities
            ];

            for (planet_idx, planet) in self.planets.iter().enumerate() {
                use log;
                log(&format!("{}", planet.num_vertices()));
                for vertex_idx in 0..planet.num_vertices() {
                    let planet_vertex_id =
                        PlanetVertexId::from_usize(&self, planet_idx, vertex_idx);
                    let CityId(city_idx) = self.vertex_idx_to_city_id[planet_vertex_id];

                    let vertex_id = PlanetVertexId::new(
                        &self,
                        PlanetId(planet_idx as u16),
                        VertexId::from_usize(vertex_idx),
                    );

                    let entry = &mut self.city_idx_to_vertex_id[city_idx as usize];

                    // sanity check before filling a valid vertex to a dummy entry
                    let PlanetVertexId {
                        vertex_id: VertexId(dummy_vertex_idx),
                        ..
                    } = entry.clone();
                    assert!(dummy_vertex_idx == MAX);

                    *entry = vertex_id;
                }
            }

            // sanity check
            assert!(self.city_idx_to_vertex_id.iter().all(
                |&PlanetVertexId {
                     vertex_id: VertexId(dummy_vertex_idx),
                     ..
                 }| dummy_vertex_idx < MAX
            ));
        }
        self
    }

    fn generate_galaxy(rng: &mut impl Rng) -> Self {
        let mut ret = Galaxy {
            stars: Vec::with_capacity(NUM_STAR_ORBITS),
            planets: Vec::with_capacity(NUM_PLANET_ESTIMATE),
            angles: HashMap::with_capacity(NUM_PLANET_ESTIMATE),
            locs: HashMap::with_capacity(NUM_PLANET_ESTIMATE),
            stationed_divisions: StationedDivisions(Vec::with_capacity(NUM_PLANET_ESTIMATE)),
            ..Self::default()
        };
        let mut star_id_gen = 1;

        for i in 0..NUM_STAR_ORBITS {
            let r = rng.gen::<f32>();
            let start = r * TWO_PI;
            let orbit_radius = ((i as f32 + 1.) * (MAX_SYSTEM_RADIUS * 2.)) as f32;
            let num_stars = rng.gen_range(MIN_STARS_PER_ORBIT, MAX_STARS_PER_ORBIT);
            let parts = TWO_PI / (num_stars as f32);

            let mut prev_star_angle = start;

            for _ in 0..num_stars {
                let star_idx = ret.stars.len();
                let star_name = format!("Star {0}", star_id_gen);
                ret.stars.push(Star {
                    name: star_name.clone(),
                    radius: rng.gen_range(MIN_STAR_RADIUS, MAX_STAR_RADIUS),
                    orbit_radius,
                });
                star_id_gen += 1;
                ret.angles
                    .insert(Locatable::Star(StarId(star_idx as u16)), prev_star_angle);

                prev_star_angle += parts;

                let num_planets = rng.gen_range(MIN_PLANETS_PER_SYSTEM, MAX_PLANETS_PER_SYSTEM);
                let mut prev_planet_radius = MAX_DIST_BETWEEN_PLANETS;
                let mut temp_planet_name_gen = 1;

                for _ in 0..num_planets {
                    let planet_idx = ret.planets.len();
                    prev_planet_radius +=
                        rng.gen_range(MIN_DIST_BETWEEN_PLANETS, MAX_DIST_BETWEEN_PLANETS);

                    let orbit = Orbit {
                        orbit_radius: prev_planet_radius,
                        center: Locatable::Star(StarId(star_idx as u16)),
                        radius: rng.gen_range(MIN_PLANET_RADIUS, MAX_PLANET_RADIUS),
                    };
                    let name = format!("{0} Planet {1}", star_name, temp_planet_name_gen);
                    let planet = Planet::new(rng, name, orbit);
                    let num_vertices = planet.num_vertices();

                    ret.planets.push(planet);
                    temp_planet_name_gen += 1;

                    let angle = rng.gen::<f32>() * TWO_PI;
                    ret.angles
                        .insert(Locatable::Planet(PlanetId(planet_idx as u16)), angle);

                    let StationedDivisions(stationed_divisions_data) = &mut ret.stationed_divisions;
                    stationed_divisions_data.push(vec![Default::default(); num_vertices]);

                    // create city vertices
                    let mut city_mapping = Vec::with_capacity(num_vertices);
                    for _ in 0..num_vertices {
                        let city_id = CityId(ret.cities.len() as u32);
                        ret.cities.push(City::new());
                        city_mapping.push(city_id);
                    }

                    let VertexToCityId(data) = &mut ret.vertex_idx_to_city_id;
                    data.push(city_mapping);
                }
            }
        }

        ret
    }

    fn generate_factions(mut self, rng: &mut impl Rng) -> Self {
        let num_planets = self.planets.len();
        let colony_factor = 0.1;
        let num_nations = ((num_planets as f32 * colony_factor) as usize).max(1);

        assert!(self.planets.len() > 0);

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
        /*
        {
            let nation_id0 = NationId::new(&self, 0);
            let nation_id1 = NationId::new(&self, 1);
            let nation_id2 = NationId::new(&self, 2);
            let planet_idx = 0;
            let planet_id = PlanetId::new(&self, planet_idx as u16);
        
            for i in 1..9 {
                let vertex_id = VertexId::from_usize(i);
                let planet_vertex_id = PlanetVertexId::new(&self, planet_id, vertex_id);
                self.try_colonize(nation_id2, planet_vertex_id);
            }
        
            let planet_vertex_id = PlanetVertexId::new(&self, planet_id, VertexId(9));
            self.try_colonize(nation_id0, planet_vertex_id);
        
            let planet_vertex_id = PlanetVertexId::new(&self, planet_id, VertexId(10));
            self.try_colonize(nation_id1, planet_vertex_id);
        
            for i in 11..30 {
                let vertex_id = VertexId::from_usize(i);
                let planet_vertex_id = PlanetVertexId::new(&self, planet_id, vertex_id);
                self.try_colonize(nation_id2, planet_vertex_id);
            }
        }
        */

        let num_planets = self.planets.len();
        for i in 0..num_nations {
            loop {
                let nation_id = NationId::new(&self, i as u16);
                let planet_idx = rng.gen_range(0, num_planets);
                let planet_id = PlanetId::new(&self, planet_idx as u16);
                let num_vertices = self.planets[planet_idx].num_vertices();
                if num_vertices == 0 {
                    break;
                }

                let vertex_idx = rng.gen_range(0, num_vertices);
                let vertex_id = VertexId::from_usize(vertex_idx);
                let planet_vertex_id = PlanetVertexId::new(&self, planet_id, vertex_id);

                if self.try_colonize(nation_id, planet_vertex_id) {
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
