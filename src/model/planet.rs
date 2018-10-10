use delaunator::{triangulate, Point};
use distance_point_segment;
use nalgebra::geometry::Point2;
use ordered_float::OrderedFloat;
use std::cmp::Ordering;
use std::collections::hash_map::Entry;
use std::collections::BinaryHeap;
use std::collections::HashMap;
use std::collections::HashSet;
use std::collections::{BTreeMap, VecDeque};
use std::ops::{Index, IndexMut};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use wbg_rand::{Rng, WasmRng};
use CityId;
use DivisionId;
use Galaxy;
use NationId;
use Orbit;
use Planet;
use PlanetEdge;
use PlanetId;
use PlanetVertexId;
use SortedEdge;
use CITY_DIST;
use CITY_DIST_OFFSET;
use EDGE_MAX_CITY_DIST;

// each node can have at most 8 edges, since each point is mapped to a grid tile
const MAX_NUM_EDGES: usize = 8;

#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: u32,
    position: u8,
}

// The priority queue depends on `Ord`.
// Explicitly implement the trait so the queue becomes a min-heap
// instead of a max-heap.
impl Ord for State {
    fn cmp(&self, other: &State) -> Ordering {
        // Notice that the we flip the ordering on costs.
        // In case of a tie we compare positions - this step is necessary
        // to make implementations of `PartialEq` and `Ord` consistent.
        other
            .cost
            .cmp(&self.cost)
            .then_with(|| self.position.cmp(&other.position))
    }
}

// `PartialOrd` needs to be implemented as well.
impl PartialOrd for State {
    fn partial_cmp(&self, other: &State) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Planet {
    pub fn new(rng: &mut WasmRng, name: String, orbit: Orbit) -> Self {
        let width = rng.gen_range(5, 16); // must be < 16 since 16^2=256 can't fit in u8
        let height = rng.gen_range(5, 16);
        let dim = (width as usize) * (height as usize);
        let mut city_coors = Vec::with_capacity(2 * dim);
        let mut city_coors2 = Vec::with_capacity(dim);

        // randomly generate points, each point is roughly mapped into a grid tile
        for j in 0..height {
            for i in 0..width {
                let x_offset = rng.gen_range(0., CITY_DIST_OFFSET);
                let x = (i as f32) * CITY_DIST + x_offset - CITY_DIST * (width as f32) / 2.;
                let y_offset = rng.gen_range(0., CITY_DIST_OFFSET);
                let y = (j as f32) * CITY_DIST + y_offset - CITY_DIST * (height as f32) / 2.;
                city_coors2.push(Point {
                    x: x as f64,
                    y: y as f64,
                });
                city_coors.push(x);
                city_coors.push(y);
            }
        }
        let result = triangulate(&city_coors2).expect("No triangulation exists.");
        let mut temp_adj_list = vec![HashMap::with_capacity(MAX_NUM_EDGES); dim];

        for i in 0..result.triangles.len() / 3 {
            let triangles = &result.triangles;
            let base = i * 3;
            let i0 = triangles[base] as u8;
            let i1 = triangles[base + 1] as u8;
            let i2 = triangles[base + 2] as u8;

            let edge = SortedEdge::new(i0, i1);
            let distance = Self::distance_helper(&city_coors, &edge);
            if distance < EDGE_MAX_CITY_DIST {
                temp_adj_list[edge.first() as usize].insert(edge.second(), distance);
            }

            let edge = SortedEdge::new(i1, i2);
            let distance = Self::distance_helper(&city_coors, &edge);
            if distance < EDGE_MAX_CITY_DIST {
                temp_adj_list[edge.first() as usize].insert(edge.second(), distance);
            }

            let edge = SortedEdge::new(i0, i2);
            let distance = Self::distance_helper(&city_coors, &edge);
            if distance < EDGE_MAX_CITY_DIST {
                temp_adj_list[edge.first() as usize].insert(edge.second(), distance);
            }
        }

        let mut adj_list = vec![Vec::with_capacity(MAX_NUM_EDGES); dim];
        for (u, vs) in temp_adj_list.iter().enumerate() {
            for (&v, &weight) in vs {
                let cost = (weight * 10000f32) as u32;
                adj_list[u].push(PlanetEdge {
                    vertex_idx: v,
                    cost,
                });
                adj_list[v as usize].push(PlanetEdge {
                    vertex_idx: u as u8,
                    cost,
                });
            }
        }

        Self {
            name,
            orbit,
            width,
            height,
            city_coors,
            adj_list,
        }
    }

    pub fn cal_dimension(&self) -> u8 {
        self.width * self.height
    }

    pub fn distance(&self, edge: &SortedEdge<u8>) -> f32 {
        Self::distance_helper(&self.city_coors, edge)
    }

    fn get_coor_helper(points: &Vec<f32>, vertex_idx: u8) -> (f32, f32) {
        let v2 = 2 * (vertex_idx as usize);
        let x = points[v2];
        let y = points[(v2 + 1)];
        (x, y)
    }

    fn distance_helper(points: &Vec<f32>, &SortedEdge(u, v): &SortedEdge<u8>) -> f32 {
        let (x0, y0) = Self::get_coor_helper(points, u);
        let (x1, y1) = Self::get_coor_helper(points, v);
        (x1 - x0).hypot(y1 - y0)
    }
}

impl Galaxy {
    pub fn search_neighbour_nations(
        &self,
        planet_id: PlanetId,
        nation_id: NationId,
    ) -> HashMap<NationId, HashSet<u8>> {
        // run breadth-first search

        let planet = &self.planets[planet_id];

        let adj_list = &planet.adj_list;
        let num_vertices = adj_list.len();
        let mut worklist = VecDeque::with_capacity(num_vertices);
        let mut visited = HashSet::with_capacity(num_vertices);
        let mut nation_borders: HashMap<_, HashSet<_>> = Default::default();

        // outer loop set up the forest
        for u in 0..num_vertices {
            let u_vertex_id = PlanetVertexId::new(self, planet_id, u as u8);
            let city = &self.cities[u_vertex_id.to_city_id(self)];
            // only interested in own nation's territory
            if city
                .controller
                .map_or(true, |controller| controller != nation_id)
            {
                continue;
            }

            // is previously visited
            if visited.replace(u as u8).is_some() {
                continue;
            }

            // breadth-first search for one vertex (u)
            worklist.push_back((u as u8, city));
            while !worklist.is_empty() {
                let (cur_vertex_idx, city) = worklist.pop_front().unwrap();

                assert!(
                    city.controller
                        .map_or(false, |controller| controller == nation_id)
                );

                // keep looking for the borders

                for &PlanetEdge {
                    vertex_idx: neighbour_vertex_idx,
                    ..
                } in &adj_list[cur_vertex_idx as usize]
                {
                    if visited.replace(neighbour_vertex_idx).is_some() {
                        continue;
                    }
                    // not visited

                    let neighbour_vertex_id =
                        PlanetVertexId::new(self, planet_id, neighbour_vertex_idx as u8);
                    let neighbour_city = &self.cities[neighbour_vertex_id.to_city_id(self)];

                    if let Some(controller) = neighbour_city.controller {
                        if controller == nation_id {
                            // neighbour city is not a border province
                            worklist.push_back((neighbour_vertex_idx, neighbour_city));
                        } else {
                            nation_borders
                                .entry(controller)
                                .or_default()
                                .insert(neighbour_vertex_idx);
                        }
                    }
                    // otherwise either territory is uncolonized
                }
            }

            worklist.clear();
        }

        nation_borders
    }

    // Dijkstra's shortest path algorithm. (copied from Rust's binary heap example)
    // Start at `start` and use `dist` to track the current shortest distance
    // to each node. This implementation isn't memory-efficient as it may leave duplicate
    // nodes in the queue. It also uses `usize::MAX` as a sentinel value,
    // for a simpler implementation.
    pub fn shortest_path(
        &self,
        planet_id: PlanetId,
        nation_id: NationId,
        is_civilian: bool,
        start: u8,
        goal: u8,
    ) -> Option<Vec<u8>> {
        let planet = &self.planets[planet_id];
        let adj_list = &planet.adj_list;

        // dist[node] = current shortest distance from `start` to `node`
        use std::u32::MAX;
        let num_vertices = adj_list.len();
        let mut dist = vec![MAX; num_vertices];
        let mut prev = vec![None; num_vertices];

        let mut heap = BinaryHeap::new();

        // We're at `start`, with a zero cost
        dist[start as usize] = 0;
        heap.push(State {
            cost: 0,
            position: start,
        });

        // Examine the frontier with lower cost nodes first (min-heap)
        while let Some(State { cost, position }) = heap.pop() {
            // Alternatively we could have continued to find all shortest paths
            if position == goal {
                let mut cur = Some(goal);
                let mut ret = Vec::with_capacity(adj_list.len() / 10);
                loop {
                    let node = cur.expect("a path is already found, so cur cannot be None");
                    ret.push(node);

                    if node == start {
                        return Some(ret);
                    }
                    cur = prev[node as usize];
                }
            }

            // Important as we may have already found a better way
            if cost > dist[position as usize] {
                continue;
            }

            // For each node we can reach, see if we can find a way with
            // a lower cost going through this node
            for edge in
                adj_list[position as usize]
                    .iter()
                    .filter(|&PlanetEdge { vertex_idx, .. }| {
                        self.can_nation_enter(
                            nation_id,
                            PlanetVertexId::new(self, planet_id, *vertex_idx),
                            is_civilian,
                        )
                    }) {
                let next = State {
                    cost: cost + edge.cost,
                    position: edge.vertex_idx,
                };

                // If so, add it to the frontier and continue
                if next.cost < dist[next.position as usize] {
                    heap.push(next);
                    // Relaxation, we have now found a better way
                    dist[next.position as usize] = next.cost;
                    prev[next.position as usize] = Some(position);
                }
            }
        }

        None
    }
}

#[wasm_bindgen]
impl Galaxy {
    pub fn interop_search_neighbour_nations(&self, planet_idx: u16, nation_idx: u16) -> JsValue {
        let planet_id = PlanetId::new(self, planet_idx);
        let nation_id = NationId::new(self, nation_idx);
        let ret = self.search_neighbour_nations(planet_id, nation_id);
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn has_division(&self, planet_idx: u16, vertex_idx: u8) -> bool {
        let planet_id = PlanetId::new(self, planet_idx);
        let vertex_id = PlanetVertexId::new(self, planet_id, vertex_idx);
        !self.stationed_divisions[vertex_id].is_empty()
    }

    pub fn cal_planet_dim(&self, planet_idx: usize) -> u8 {
        let planet = &self.planets[planet_idx];
        planet.cal_dimension()
    }

    pub fn get_planet_width(&self, planet_id: usize) -> u8 {
        let planet = &self.planets[planet_id];
        planet.width
    }

    pub fn get_planet_height(&self, planet_id: usize) -> u8 {
        let planet = &self.planets[planet_id];
        planet.height
    }

    pub fn get_planet_points(&self, planet_id: usize) -> *const f32 {
        let planet = &self.planets[planet_id];
        planet.city_coors.as_ptr()
    }

    pub fn get_planet_path(
        &self,
        planet_idx: u16,
        nation_idx: u16,
        is_civilian: bool,
        start: u8,
        goal: u8,
    ) -> Vec<u8> {
        let planet_id = PlanetId::new(self, planet_idx);
        let nation_id = NationId::new(self, nation_idx);
        self.shortest_path(planet_id, nation_id, is_civilian, start, goal)
            .unwrap_or_default()
    }

    pub fn get_planet_edges(&self, planet_id: usize) -> Vec<u8> {
        let planet = &self.planets[planet_id];
        let mut ret = Vec::with_capacity(MAX_NUM_EDGES * planet.adj_list.len());

        for (u, vs) in planet.adj_list.iter().enumerate() {
            for &PlanetEdge { vertex_idx: v, .. } in vs {
                if (u as u8) < v {
                    ret.push(u as u8);
                    ret.push(v);
                }
            }
        }
        ret
    }

    pub fn get_planet_name(&self, planet_idx: usize) -> String {
        let planet = &self.planets[planet_idx];
        planet.name.to_string()
    }

    pub fn cal_planet_click(&self, planet_idx: usize, x1: f32, y1: f32) -> String {
        let p1 = Point2::new(x1, y1);
        let planet = &self.planets[planet_idx];

        use std::f32::MAX;
        let mut min_dist = MAX;

        for i in 0..planet.city_coors.len() / 2 {
            let idx = 2 * i;
            let x2 = planet.city_coors[idx];
            let y2 = planet.city_coors[idx + 1];
            let p2 = Point2::new(x2, y2);
            let radius = 10.;
            let dist = (p1 - p2).norm();
            if dist <= radius && dist < min_dist {
                min_dist = dist;
            }
        }

        for (u, vs) in planet.adj_list.iter().enumerate() {
            for &PlanetEdge { vertex_idx: v, .. } in vs {
                if (u as u8) > v {
                    continue;
                }

                let u2 = (2 * u) as usize;
                let v2 = (2 * v) as usize;

                let ux = planet.city_coors[u2];
                let uy = planet.city_coors[u2 + 1];
                let u = Point2::new(ux, uy);

                let vx = planet.city_coors[v2];
                let vy = planet.city_coors[v2 + 1];
                let v = Point2::new(vx, vy);

                let radius = 10.;
                let dist = distance_point_segment(&p1, &u, &v);
                if dist <= radius && dist < min_dist {
                    min_dist = dist;
                }
            }
        }

        min_dist.to_string()
    }
}
