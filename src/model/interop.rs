use coor::{CartesianCoor, PolarCoor};
use delaunator::{triangulate, Point};
use nalgebra::geometry::Point2;
use ordered_float::OrderedFloat;
use rand::prng::isaac::IsaacRng;
use rand::Rng;
use std::collections::HashMap;
use std::collections::HashSet;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use {
    BaseCraft, BaseCraftStructure, CityGraph, CityId, ColonyId, CorporationId, EnumMap, Faction,
    Freighter, Galaxy, Id, NationId, PlanetId, PlanetVertexId, Soldiers, SortedEdge, VertexId,
    VertexToCityId, CITY_RADIUS_LIMIT,
};

#[derive(Serialize, Deserialize)]
struct PlanetInfo {
    name: String,
    territory: u32,
    atmostphere: u32,
    habitability: u32,
}

#[wasm_bindgen]
pub struct NeighbourNations {
    result: HashMap<NationId, HashSet<usize>>,
}

#[wasm_bindgen]
impl NeighbourNations {
    pub fn get_nation_ids(&self) -> Vec<u32> {
        self.result
            .keys()
            .map(|&NationId(idx)| idx as u32)
            .collect()
    }

    pub fn get_num_border_tiles(&self, nation_idx: u32) -> u32 {
        match self.result.get(&NationId(nation_idx as u16)) {
            Some(result) => result.len() as u32,
            None => 0,
        }
    }

    pub fn get_border_tiles(&self, nation_idx: u32) -> Vec<u32> {
        match self.result.get(&NationId(nation_idx as u16)) {
            Some(result) => result.iter().map(|&x| x as u32).collect(),
            None => Vec::default(),
        }
    }
}

#[wasm_bindgen]
impl Galaxy {
    pub fn interop_search(&self, x1: f32, y1: f32) -> JsValue {
        let ret: Vec<_> = self.search(&Point2::new(x1, y1));
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn interop_search_name(&self, name: String) -> JsValue {
        let ret = self.search_name(&name);
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn interop_cal_draw_data(
        &self,
        tlx: f64, // top-left x
        tly: f64, // top-left y
        brx: f64, // bottom-right x
        bry: f64, // bottom-right y
        grid_size: f32,
    ) -> JsValue {
        let ret = self.cal_draw_data_helper(tlx, tly, brx, bry, grid_size);
        JsValue::from_serde(&ret).unwrap()
    }

    /*
    pub fn interop_cal_civilian_demands(&self, id: JsValue) -> Vec<u32> {
        let ColonyId {
            planet_idx,
            colony_idx,
        } = Self::get_colony_id(id);
        let planet = &self.planets[planet_idx];
        let colony = &planet.colonies[colony_idx];
        Product::to_raw_u32_arr(colony.cal_civilian_demands())
    }
    */

    /*
    pub fn interop_cal_corporate_demands(&self, id: JsValue) -> Vec<u32> {
        let ColonyId {
            planet_idx,
            colony_idx,
        } = Self::get_colony_id(id);
        let planet = &self.planets[planet_idx];
        let colony = &planet.colonies[colony_idx];
        Product::to_raw_u32_arr(colony.cal_corporate_demands())
    }
    */

    /*
    pub fn interop_cal_supply(&self, id: JsValue) -> Vec<u32> {
        let ColonyId {
            planet_idx,
            colony_idx,
        } = Self::get_colony_id(id);
        let planet = &self.planets[planet_idx];
        let colony = &planet.colonies[colony_idx];
        Product::to_raw_u32_arr(colony.market_storage)
    }
    */

    /*
    pub fn interop_create_player(&mut self, name: String, job: Job) -> JsValue {
        let player = Specialist { name, job };
        let specialist_id = self.specialists.len();
        self.specialists.push(player);
        let id = SpecialistId(specialist_id);
        self.player = Some(id);
        JsValue::from_serde(&id).unwrap()
    }
    */

    pub fn get_city_idx(&mut self, planet_idx: usize, vertex_idx: usize) -> u32 {
        let planet_id = PlanetId::from_usize(self, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let planet_vertex_id = PlanetVertexId::new(self, planet_id, vertex_id);
        let CityId(idx) = self.vertex_idx_to_city_id[planet_vertex_id];
        idx
    }

    pub fn get_city_radius_limit() -> f32 {
        CITY_RADIUS_LIMIT
    }

    pub fn cal_city_graph(&mut self, planet_idx: u16, vertex_idx: usize) -> CityGraph {
        let planet_id = PlanetId(planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let planet_vertex_id = PlanetVertexId {
            planet_id,
            vertex_id,
        };
        self.city_graphs
            .entry(planet_vertex_id)
            .or_insert_with(|| {
                let upper = (planet_idx as u64) << 32;
                let lower = vertex_idx as u64;
                let hash = upper | lower;

                let mut rng = IsaacRng::new_from_u64(hash);

                // TODO calculate development
                let dev = rng.gen_range(20u8, 80u8);

                let mut points2 = Vec::with_capacity(dev as usize);
                let mut points = Vec::with_capacity(2 * dev as usize);
                let mut dims = Vec::with_capacity(2 * dev as usize);

                let mut visited = HashSet::new();
                for _ in 0..dev {
                    let coor = PolarCoor::random_point_in_circle(&mut rng, CITY_RADIUS_LIMIT)
                        .to_cartesian();

                    if !visited.insert(coor) {
                        continue;
                    }

                    let (x, y) = coor.to_pair();

                    let w = rng.gen_range(0.1, 0.2);
                    let h = rng.gen_range(0.1, 0.2);
                    points2.push(Point {
                        x: x as f64,
                        y: y as f64,
                    });
                    points.push(x);
                    points.push(y);
                    dims.push(w);
                    dims.push(h);
                }

                let roads = triangulate(&points2)
                    .and_then(|result| {
                        let mut visited = HashSet::new();

                        let mut roads = Vec::with_capacity(600);

                        for i in 0..result.triangles.len() / 3 {
                            let triangles = &result.triangles;
                            let base = i * 3;
                            let i0 = triangles[base] as u8;
                            let i1 = triangles[base + 1] as u8;
                            let i2 = triangles[base + 2] as u8;

                            let edge = SortedEdge::new(i0, i1);
                            if visited.insert(edge) {
                                roads.push(edge.first());
                                roads.push(edge.second());
                            }

                            let edge = SortedEdge::new(i1, i2);
                            if visited.insert(edge) {
                                roads.push(edge.first());
                                roads.push(edge.second());
                            }

                            let edge = SortedEdge::new(i0, i2);
                            if visited.insert(edge) {
                                roads.push(edge.first());
                                roads.push(edge.second());
                            }
                        }

                        Some(roads)
                    })
                    .unwrap_or_default();

                CityGraph {
                    num_structures: dev,
                    points,
                    dims,
                    roads,
                }
            })
            .clone()
    }

    pub fn get_colonized_map(&self, planet_idx: usize) -> Vec<i32> {
        let VertexToCityId(data) = &self.vertex_idx_to_city_id;
        data[planet_idx]
            .iter()
            .map(
                |&CityId(city_idx)| match self.cities[city_idx as usize].owner {
                    Some(NationId(nation_idx)) => nation_idx as i32,
                    None => -1,
                },
            )
            .collect()
    }
}

#[wasm_bindgen]
impl Galaxy {
    pub fn mock_cal_civilian_demands(&mut self, corp_id: JsValue) {
        let corp_id = Self::get_corp_id(corp_id);

        let ships = &mut self.ships;
        ships.freighters.push(Freighter {
            space_craft: BaseCraft {
                design_faction: Faction::Corporation(corp_id),
                owner: Faction::Corporation(corp_id),
                structure: BaseCraftStructure {
                    // structure
                    weapon: 1,
                    shield: 1,
                    shield_charge: 1.0,
                    hull: 1,
                    engine: 1,

                    // consumable
                    ammunition: 1,
                    fuel: 1,

                    // boarding
                    crew: Soldiers::default(),
                },
                coor: Point2::origin(),
            },
            storage: EnumMap::default(),
        });
    }

    /*
    pub fn print_industrial_capacity(&self) {
        for planet in &self.planets {
            for colony in &planet.colonies {
                for &office_idx in &colony.offices {
                    let office = &self.offices[office_idx];
                    //
                    for (product, params) in &office.products {
                        use log;
                        log(&format!(
                            "product: {:?}, cap: {}",
                            product, params.production_capacity
                        ));
                    }
                }
            }
        }
    }
    */

    /*
    pub fn print_dev(&self) -> String {
        let population = self.cal_population();
        let colony = &self.colonies[0];
        format!(
            "housing: {}, population: {}",
            colony.housing, population as u32
        )
    }
    
    pub fn get_colony(&self) -> Colony {
        self.colonies[0].clone()
    }
    */

    /*
    pub fn get_planet_tile_dimension(&self) -> Vec<u32> {
        let planet = &self.planets[0];
        vec![planet.tiles.width as u32, planet.tiles.height as u32]
    }
    */

    /*
    pub fn get_tile_at(&self, x: u32, y: u32) -> TileData {
        let planet = &self.planets[0];
    
        let x = x as usize;
        let y = y as usize;
        let tiles = &planet.tiles;
        let width = tiles.width;
        let height = tiles.height;
    
        assert!(x < width && y < height);
        let idx = y * width + x;
        let tile = &tiles.data[idx];
        tile.clone()
    }
    
    pub fn is_tile_controlled(&self, x: u32, y: u32) -> bool {
        let planet = &self.planets[0];
        let colony = &self.colonies[0];
    
        let x = x as usize;
        let y = y as usize;
        let tiles = &planet.tiles;
        let width = tiles.width;
        let height = tiles.height;
    
        assert!(x < width && y < height);
        let idx = y * width + x;
        colony.controlled_tiles[idx]
    }
    
    // TODO return Vec<usize>
    pub fn interop_get_neighbour_countries(&self) -> Vec<u32> {
        self.get_neighbour_countries()
            .into_iter()
            .map(|NationId(idx)| idx as u32)
            .collect()
    }
    
    pub fn interop_search_neighbour_countries(&self) -> NeighbourNations {
        NeighbourNations {
            result: self.get_neighbour_tiles(),
        }
    }
    
    pub fn is_tile_controlled_by_others(&self, x: u32, y: u32) -> bool {
        let planet = &self.planets[0];
        let colony = &self.colonies[0];
    
        let x = x as usize;
        let y = y as usize;
        let tiles = &planet.tiles;
        let width = tiles.width;
        let height = tiles.height;
    
        assert!(x < width && y < height);
        let idx = y * width + x;
        !colony.controlled_tiles[idx] && tiles.data[idx].controller.is_some()
    }
    
    pub fn mark_controlled_tile(&mut self, x: u32, y: u32, mark: bool) {
        let planet = &self.planets[0];
        let colony = &mut self.colonies[0];
    
        let x = x as usize;
        let y = y as usize;
        let tiles = &planet.tiles;
        let width = tiles.width;
        let height = tiles.height;
    
        assert!(x < width && y < height);
        let idx = y * width + x;
        colony.controlled_tiles[idx] = mark;
    }
    */

    /*
    pub fn add_industries(&mut self, x: u32, y: u32, new_factories: u32) {
        let industry = self.cal_colony_industry() + new_factories;
        let population = self.cal_population();
        let colony = &self.colonies[0];
        let industry_employed = industry * 1000000;
        if (population as u32) < industry_employed {
            return;
        }
    
        let planet = &mut self.planets[0];
    
        let x = x as usize;
        let y = y as usize;
        let tiles = &mut planet.tiles;
        let width = tiles.width;
        let height = tiles.height;
    
        assert!(x < width && y < height);
        let idx = y * width + x;
        let tile = &mut tiles.data[idx];
        tile.factories += new_factories;
    }
    
    pub fn cal_colony_industry(&self) -> u32 {
        let colony = &self.colonies[0];
        let planet = &self.planets[0];
        let tiles = &planet.tiles;
    
        let sum: u32 = colony
            .controlled_tiles
            .iter()
            .enumerate()
            .filter(|&(_, &is_controlled)| is_controlled)
            .map(|(tile_idx, _)| {
                let tile = &tiles.data[tile_idx];
                tile.factories
            })
            .sum();
    
        // 1 free factory to bootstrap the economy
        1 + sum
    }
    
    pub fn cal_colony_used_industry(&self) -> u32 {
        let colony = &self.colonies[0];
    
        colony
            .products
            .iter()
            .map(|(_, data)| data.production_capacity)
            .sum()
    }
    
    pub fn add_industry(&mut self, product: Product) {
        let available = self.cal_colony_industry();
        let used = self.cal_colony_used_industry();
    
        assert!(used < available);
    
        let colony = &mut self.colonies[0];
        let product = &mut colony.products[product];
        product.production_capacity += 1;
    }
    
    pub fn remove_industry(&mut self, product: Product) {
        let colony = &mut self.colonies[0];
        let product = &mut colony.products[product];
        assert!(product.production_capacity > 0);
        product.production_capacity -= 1;
    }
    
    pub fn get_colony_storage(&self, product: Product) -> ProductParams {
        let colony = &self.colonies[0];
        colony.products[product].clone()
    }
    
    pub fn add_army(&mut self) {
        self.colonies[0].soldiers.push(
            /* Soldiers {
                troops: 100,
                rifle: 0,
                uniform: 0,
                saber: 0,
                exoskeleton: 0,
            }
            */
    100,
    );
    }

    pub fn get_armies_len(&self) -> usize {
    self.colonies[0].soldiers.len()
    }

    pub fn get_army(&self, idx: usize) -> u32 {
    self.colonies[0].soldiers[idx]
    }
     */

    pub fn get_nation_relation(&self, other_nation_idx: u16) -> i32 {
        let nation = &self.nations[0];
        let target_nation_id = NationId::new(self, other_nation_idx);
        nation.foreign[target_nation_id].relation
    }

    /*
    pub fn add_garrison(&mut self, at: usize, num_soldiers: u32) {
        let colony = &mut self.colonies[0];
        let entry = colony.garrison.entry(at);
        *entry.or_insert(0) += num_soldiers;
    }
    
    pub fn get_garrison(&self, x: usize, y: usize) -> u32 {
        let planet = &self.planets[0];
        let idx = planet.to_idx(x, y);
        self.get_garrison_helper(idx)
    }
    
    fn get_garrison_helper(&self, idx: usize) -> u32 {
        let planet = &self.planets[0];
        let colony = &self.colonies[0];
        let limit = planet.tiles.data[idx].population as f32 * 0.1;
        limit as u32
        //  colony.garrison.get(&idx).cloned().unwrap_or_default()
    }
    
    pub fn attack(&self, x: usize, y: usize, dir: Direction) {
        //
        let planet = &self.planets[0];
        let idx = planet.to_idx(x, y);
        let colony = &self.colonies[0];
    
        let target_idx = planet.next(x, y, dir).unwrap();
    }
    */
}

impl Galaxy {
    fn get_colony_id(id: JsValue) -> ColonyId {
        let id: Id = id.into_serde().expect("cannot parse colony id");
        match id {
            Id::Colony(id) => id,
            _ => unreachable!("invalid data: expect Id::Colony, got {:?}", id),
        }
    }

    fn get_corp_id(id: JsValue) -> CorporationId {
        let id: Id = id.into_serde().expect("cannot parse corp id");
        match id {
            Id::Corporation(id) => id,
            _ => unreachable!("invalid data: expect Id::Corporation, got {:?}", id),
        }
    }

    fn get_nation_id(id: JsValue) -> NationId {
        let id: Id = id.into_serde().expect("cannot parse nation id");
        match id {
            Id::Nation(id) => id,
            _ => unreachable!("invalid data: expect Id::Nation, got {:?}", id),
        }
    }

    fn get_planet_id(id: JsValue) -> PlanetId {
        let id: Id = id.into_serde().expect("cannot parse planet id");
        match id {
            Id::Planet(id) => id,
            _ => unreachable!("invalid data: expect Id::Planet, got {:?}", id),
        }
    }
}
