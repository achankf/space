use constants::CITY_RADIUS_LIMIT;
use coor::PolarCoor;
use delaunator::{triangulate, Point};
use rand::prng::isaac::IsaacRng;
use rand::Rng;
use std::collections::HashMap;
use std::collections::HashSet;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use {
    CityGraph, CityId, Galaxy, NationId, PlanetId, PlanetVertexId, SortedEdge, VertexId,
    VertexToCityId,
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
    pub fn get_city_idx(&mut self, planet_idx: usize, vertex_idx: usize) -> u32 {
        let planet_id = PlanetId::from_usize(&self.planets, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let planet_vertex_id = PlanetVertexId::new(&self.planets, planet_id, vertex_id);
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
