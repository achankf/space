use constants::{
    MAX_DIST_BETWEEN_PLANETS, MAX_PLANETS_PER_SYSTEM, MAX_PLANET_RADIUS, MAX_STARS_PER_ORBIT,
    MAX_STAR_RADIUS, MAX_SYSTEM_RADIUS, MIN_DIST_BETWEEN_PLANETS, MIN_PLANETS_PER_SYSTEM,
    MIN_PLANET_RADIUS, MIN_STARS_PER_ORBIT, MIN_STAR_RADIUS, NUM_PLANET_ESTIMATE, NUM_STAR_ORBITS,
    TWO_PI,
};
use coor::{CartesianCoor, PolarCoor};
use enum_map::EnumMap;
use std::collections::HashSet;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use wbg_rand::{wasm_rng, Rng};
use FleetId;
use SpacecraftKind;
use {
    AccessRight, CityId, CityIdToVertex, FactionData, Fleet, FleetAction, FleetData, FleetState,
    Foreign, Galaxy, Nation, NationId, Planet, PlanetId, PlanetVertexId, Star, StarId,
    StationedDivisions, TravelTarget, VertexId, VertexToCityId,
};

#[wasm_bindgen]
impl Galaxy {
    pub fn new() -> Self {
        let mut rng = wasm_rng();
        let mut ret = Self::generate_galaxy(&mut rng).generate_factions(&mut rng);

        ret.update_mappings();
        ret.update_locs();
        ret
    }

    pub fn interop_colonize(&mut self, nation_idx: u16, planet_idx: u16, vertex_idx: usize) {
        let planet_id = PlanetId::new(&self.planets, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let vertex_id = PlanetVertexId::new(&self.planets, planet_id, vertex_id);
        let nation_id = NationId::new(self, nation_idx);
        self.colonize(nation_id, vertex_id);
    }

    pub fn get_num_nations(&self) -> String {
        format!("#nations:{}", self.nations.len())
    }

    pub fn assign_people() {}

    pub fn unassign_people() {}

    pub fn build_spacecraft() {}

    pub fn print_fleets() {}

    pub fn create_fleet(&mut self, x: f32, y: f32, composition_factors: JsValue) -> JsValue {
        // TODO make fleet spawn in a base (instead of coordinates) and make it docked to start with

        let composition_factors: Vec<u32> = composition_factors.into_serde().unwrap();

        let composition = enum_map!{
            spacecraft_kind => FleetData {
                desired_factor: composition_factors[spacecraft_kind as usize],
                ..Default::default()
            },
        };

        let ret = Fleet {
            composition,
            cargo: Default::default(),
            state: FleetState::Ready(CartesianCoor::new(x, y)),
            actions: Default::default(),
        };

        let id = FleetId(self.fleets.len());
        self.fleets.push(ret);
        JsValue::from_serde(&id).unwrap()
    }

    pub fn update_fleet_composition(&mut self, fleet_id: JsValue, composition_factors: JsValue) {
        // assert fleet is docked

        let fleet_id: FleetId = fleet_id.into_serde().unwrap();
        let composition_factors: Vec<u32> = composition_factors.into_serde().unwrap();

        for (spacecraft_kind, data) in &mut self.fleets[fleet_id].composition {
            data.desired_factor = composition_factors[spacecraft_kind as usize];

            // TODO release extra spacecrafts
        }
    }

    pub fn move_fleet_to_coor(&mut self, fleet_id: JsValue, x: f32, y: f32) {
        let fleet_id: FleetId = fleet_id.into_serde().unwrap();
        let fleet = &mut self.fleets[fleet_id];
        fleet
            .actions
            .push_back(FleetAction::Travel(TravelTarget::Coor(CartesianCoor::new(
                x, y,
            ))));

        use log;
        log(&format!("{:?}", fleet.state));
    }

    pub fn set_fleet_stance() {}

    pub fn set_fleet_operation_range() {}

    pub fn build_space_station_around_planet(planet_idx: usize, radius: f32, θ: f32) {}

    pub fn build_space_station_around_star(star_idx: usize, radius: f32, θ: f32) {}

    pub fn invade_colony() {}

    pub fn colonize_planet() {}

    pub fn add_division() {}

    pub fn group_division() {}
}

impl Galaxy {
    pub fn get_city_coor(&self, city_id: CityId) -> (f32, f32) {
        let PlanetVertexId {
            planet_id,
            vertex_id,
        } = self.to_vertex_id(city_id);
        let planet = &self.planets[planet_id];

        // to find the absolute coordinates, add the city's relative coor to the planet's coor
        let (x0, y0) = planet.get_coor(&self).to_pair();
        let (x1, y1) = planet.get_city_coor(vertex_id);

        (x0 + x1, y0 + y1)
    }

    pub fn colonize(&mut self, nation_id: NationId, vertex_id: PlanetVertexId) {
        if !self.try_colonize(nation_id, vertex_id) {
            unimplemented!("not handled");
        }
    }

    pub fn try_colonize(&mut self, nation_id: NationId, planet_vertex_id: PlanetVertexId) -> bool {
        let PlanetVertexId { planet_id, .. } = planet_vertex_id;

        let PlanetId(planet_idx) = planet_id;
        let CityId(city_idx) = self.vertex_idx_to_city_id[planet_vertex_id];
        let city = &mut self.cities[city_idx as usize];
        if city.owner.is_some() || city.controller.is_some() {
            return false;
        }

        let planet = &self.planets[planet_idx as usize];

        use log;
        log(&format!(
            "{:?} (System: {:?}) is colonizing {} (vertex: {:?}, colony: {})",
            nation_id, planet.star_system, planet.name, planet_vertex_id, city_idx
        ));

        city.owner = Some(nation_id);
        city.controller = Some(nation_id);
        return true;
    }

    fn update_mappings(&mut self) {
        {
            use std::u8::MAX;

            // insert dummy data for random access later
            self.city_id_to_vertex_id = CityIdToVertex({
                let num_cities = self.cities.len();
                vec![
                    PlanetVertexId {
                        planet_id: PlanetId(0),
                        vertex_id: VertexId(MAX),
                    };
                    num_cities
                ]
            });

            for (planet_idx, planet) in self.planets.iter().enumerate() {
                let num_vertices = planet.num_vertices();
                assert!(num_vertices < (MAX as usize));
                for vertex_idx in 0..num_vertices {
                    let planet_vertex_id =
                        PlanetVertexId::from_usize(&self.planets, planet_idx, vertex_idx);
                    let city_id = self.vertex_idx_to_city_id[planet_vertex_id];

                    let vertex_id = PlanetVertexId::new(
                        &self.planets,
                        PlanetId(planet_idx as u16),
                        VertexId::from_usize(vertex_idx),
                    );

                    let entry = &mut self.city_id_to_vertex_id[city_id];

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
            assert!({
                let CityIdToVertex(mapping) = &self.city_id_to_vertex_id;
                mapping.iter().all(
                    |&PlanetVertexId {
                         vertex_id: VertexId(dummy_vertex_idx),
                         ..
                     }| dummy_vertex_idx < MAX,
                )
            });
        }
    }

    fn generate_galaxy(rng: &mut impl Rng) -> Self {
        let mut ret = Galaxy {
            stars: Vec::with_capacity(NUM_STAR_ORBITS),
            planets: Vec::with_capacity(NUM_PLANET_ESTIMATE),
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
                star_id_gen += 1;
                prev_star_angle += parts;

                let num_planets = rng.gen_range(MIN_PLANETS_PER_SYSTEM, MAX_PLANETS_PER_SYSTEM);
                let mut prev_planet_radius = MAX_DIST_BETWEEN_PLANETS;
                let mut temp_planet_name_gen = 1;
                let mut planets = Vec::with_capacity(num_planets);

                for _ in 0..num_planets {
                    prev_planet_radius +=
                        rng.gen_range(MIN_DIST_BETWEEN_PLANETS, MAX_DIST_BETWEEN_PLANETS);

                    let name = format!("{0} Planet {1}", star_name, temp_planet_name_gen);
                    let radius = rng.gen_range(MIN_PLANET_RADIUS, MAX_PLANET_RADIUS);
                    let system_id = StarId::wrap_usize(star_idx);
                    let angle = rng.gen::<f32>() * TWO_PI;
                    let coor = PolarCoor::new(prev_planet_radius, angle);
                    let planet = Planet::new(rng, name, radius, (system_id, coor));
                    let num_vertices = planet.num_vertices();
                    let planet_id = PlanetId(ret.planets.len() as u16);

                    ret.planets.push(planet);
                    temp_planet_name_gen += 1;

                    let StationedDivisions(stationed_divisions_data) = &mut ret.stationed_divisions;
                    stationed_divisions_data.push(vec![Default::default(); num_vertices]);

                    // create city vertices
                    let mut city_mapping = Vec::with_capacity(num_vertices);
                    for _ in 0..num_vertices {
                        let city_id = CityId(ret.cities.len() as u32);
                        ret.cities.push(Default::default());
                        city_mapping.push(city_id);
                    }

                    let VertexToCityId(data) = &mut ret.vertex_idx_to_city_id;
                    data.push(city_mapping);

                    planets.push(planet_id);
                }

                ret.stars.push(Star {
                    name: star_name.clone(),
                    radius: rng.gen_range(MIN_STAR_RADIUS, MAX_STAR_RADIUS),
                    coor: PolarCoor::new(orbit_radius, prev_star_angle),
                    planets,
                });
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
                tax_rate: 0.0,
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

        let num_planets = self.planets.len();
        for i in 0..num_nations {
            loop {
                let nation_id = NationId::new(&self, i as u16);
                let planet_idx = rng.gen_range(0, num_planets);
                let planet_id = PlanetId::new(&self.planets, planet_idx as u16);
                let num_vertices = self.planets[planet_idx].num_vertices();
                if num_vertices == 0 {
                    break;
                }

                let vertex_idx = rng.gen_range(0, num_vertices);
                let vertex_id = VertexId::from_usize(vertex_idx);
                let planet_vertex_id = PlanetVertexId::new(&self.planets, planet_id, vertex_id);

                if self.try_colonize(nation_id, planet_vertex_id) {
                    break;
                }
            }
        }

        self
    }
}
