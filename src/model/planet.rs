use constants::{EDGE_MAX_CITY_DIST, PLANET_CITY_STEP_SIZE};
use coor::{CartesianCoor, PolarCoor};
use delaunator::{triangulate, Point};
use nalgebra::geometry::Point2;
use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, HashSet, VecDeque};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use wbg_rand::Rng;
use {
    distance_point_segment, Galaxy, NationId, Planet, PlanetAdjList, PlanetEdge, PlanetId,
    PlanetVertexId, SortedEdge, StarId, VertexId,
};

// each node can have at most 8 edges, since each point is mapped to a grid tile
const MAX_VERTEX_DEGREE: usize = 8;

#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: u32,
    position: VertexId,
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
    pub fn new(
        rng: &mut impl Rng,
        name: String,
        radius: f32,
        (star_system, coor): (StarId, PolarCoor),
    ) -> Self {
        let radius_after_padding = radius - 3.;
        let radius_after_padding_squared = radius_after_padding * radius_after_padding;
        assert!(radius_after_padding > 0.);

        // randomly generate points, each point is roughly mapped into a grid tile
        let step_side = PLANET_CITY_STEP_SIZE;
        let step_portion = step_side / 4.;

        let mut start_x = -radius;
        let capacity_estimates = (radius / step_side).ceil() as usize;

        let mut city_coors = Vec::with_capacity(2 * capacity_estimates);
        let mut city_coors_tri = Vec::with_capacity(capacity_estimates);

        while start_x < radius {
            let next_x = start_x + step_side;

            let mut start_y = -radius;
            while start_y < radius {
                let next_y = start_y + step_side;
                let x = rng.gen_range(start_x + step_portion, next_x - step_portion);
                let y = rng.gen_range(start_y + step_portion, next_y - step_portion);

                // if point is within the circle (planet)
                if x * x + y * y <= radius_after_padding_squared {
                    city_coors.push(x);
                    city_coors.push(y);
                    city_coors_tri.push(Point {
                        x: x as f64,
                        y: y as f64,
                    });
                }

                start_y = next_y;
            }

            start_x = next_x;
        }

        let num_vertices = city_coors_tri.len();

        let temp_adj_list = triangulate(&city_coors_tri)
            .and_then(|result| {
                let mut ret = vec![HashMap::with_capacity(MAX_VERTEX_DEGREE); num_vertices];

                for i in 0..result.triangles.len() / 3 {
                    let triangles = &result.triangles;
                    let base = i * 3;
                    let i0 = VertexId::from_usize(triangles[base]);
                    let i1 = VertexId::from_usize(triangles[base + 1]);
                    let i2 = VertexId::from_usize(triangles[base + 2]);

                    let edge = SortedEdge::new(i0, i1);
                    let distance = Self::distance_from_edge(&city_coors, &edge);
                    if distance < EDGE_MAX_CITY_DIST {
                        let VertexId(vertex_idx) = edge.first();
                        ret[vertex_idx as usize].insert(edge.second(), distance);
                    }

                    let edge = SortedEdge::new(i1, i2);
                    let distance = Self::distance_from_edge(&city_coors, &edge);
                    if distance < EDGE_MAX_CITY_DIST {
                        let VertexId(vertex_idx) = edge.first();
                        ret[vertex_idx as usize].insert(edge.second(), distance);
                    }

                    let edge = SortedEdge::new(i0, i2);
                    let distance = Self::distance_from_edge(&city_coors, &edge);
                    if distance < EDGE_MAX_CITY_DIST {
                        let VertexId(vertex_idx) = edge.first();
                        ret[vertex_idx as usize].insert(edge.second(), distance);
                    }
                }
                Some(ret)
            })
            .unwrap_or_default();

        let adj_list = {
            let mut ret = vec![Vec::with_capacity(MAX_VERTEX_DEGREE); num_vertices];
            for (u_idx, vs) in temp_adj_list.iter().enumerate() {
                let u_vertex = VertexId::from_usize(u_idx);
                for (&v, &weight) in vs {
                    let VertexId(v_idx) = v;
                    let cost = (weight * 10000f32) as u32;
                    ret[u_idx].push(PlanetEdge { vertex_id: v, cost });
                    ret[v_idx as usize].push(PlanetEdge {
                        vertex_id: u_vertex,
                        cost,
                    });
                }
            }
            PlanetAdjList(ret)
        };

        let shortest_paths = (0..temp_adj_list.len())
            .map(|u_idx| VertexId::from_usize(u_idx))
            .map(|u_vertex| Planet::shortest_path(&adj_list, u_vertex))
            .collect();

        Self {
            name,
            radius,
            city_coors,
            adj_list,
            star_system,
            coor,
            frontlines: Default::default(),
            shortest_paths,
        }
    }

    pub fn num_vertices(&self) -> usize {
        let PlanetAdjList(adj_list) = &self.adj_list;
        adj_list.len()
    }

    fn distance_helper(points: &Vec<f32>, u: VertexId, v: VertexId) -> f32 {
        let (x0, y0) = Self::get_coor_helper(points, u);
        let (x1, y1) = Self::get_coor_helper(points, v);
        (x1 - x0).hypot(y1 - y0)
    }

    pub fn distance(&self, u: VertexId, v: VertexId) -> f32 {
        Self::distance_helper(&self.city_coors, u, v)
    }

    fn get_coor_helper(points: &Vec<f32>, vertex_id: VertexId) -> (f32, f32) {
        let VertexId(vertex_idx) = vertex_id;

        let v2 = 2 * (vertex_idx as usize);
        let x = points[v2];
        let y = points[(v2 + 1)];
        (x, y)
    }

    fn distance_from_edge(points: &Vec<f32>, &SortedEdge(u, v): &SortedEdge<VertexId>) -> f32 {
        Self::distance_helper(points, u, v)
    }

    pub fn get_coor(&self, galaxy: &Galaxy) -> CartesianCoor {
        let star = &galaxy.stars[self.star_system];
        self.coor.to_cartesian() + star.coor.to_cartesian()
    }

    fn shortest_path(
        PlanetAdjList(adj_list): &PlanetAdjList,
        src_vertex: VertexId,
    ) -> Vec<Option<(VertexId, u32)>> {
        let VertexId(start) = src_vertex;

        // dist[node] = current shortest distance from `start` to `node`
        use std::u32::MAX;
        let num_vertices = adj_list.len();
        let mut dist = vec![MAX; num_vertices]; // TODO remove this and somehow use ret instead
        let mut ret = vec![None; num_vertices];

        let mut heap = BinaryHeap::new();

        // We're at `start`, with a zero cost
        dist[start as usize] = 0;
        heap.push(State {
            cost: 0,
            position: src_vertex,
        });

        // Examine the frontier with lower cost nodes first (min-heap)
        while let Some(State { cost, position }) = heap.pop() {
            // Important as we may have already found a better way
            let VertexId(position_idx) = position;
            if cost > dist[position_idx as usize] {
                continue;
            }

            // For each node we can reach, see if we can find a way with
            // a lower cost going through this node
            for edge in &adj_list[position_idx as usize] {
                let next = State {
                    cost: cost + edge.cost,
                    position: edge.vertex_id,
                };

                let VertexId(next_idx) = next.position;

                // If so, add it to the frontier and continue
                if next.cost < dist[next_idx as usize] {
                    heap.push(next);
                    // Relaxation, we have now found a better way
                    dist[next_idx as usize] = next.cost;
                    ret[next_idx as usize] = Some((position, next.cost));
                }
            }
        }
        ret
    }

    pub fn get_neighbours<'a>(&'a self, source: VertexId) -> impl Iterator<Item = &'a VertexId> {
        self[source].iter().map(|edge| &edge.vertex_id)
    }

    pub fn get_city_coor(&self, VertexId(idx): VertexId) -> (f32, f32) {
        let x_idx = (2 * idx) as usize;
        let y_idx = x_idx + 1;
        (self.city_coors[x_idx], self.city_coors[y_idx])
    }
}

impl Galaxy {
    pub fn search_neighbour_nations(
        &self,
        planet_id: PlanetId,
        nation_id: NationId,
    ) -> HashMap<NationId, HashSet<VertexId>> {
        // run breadth-first search

        let planet = &self.planets[planet_id];

        let adj_list = &planet.adj_list;
        let num_vertices = planet.num_vertices();
        let mut worklist = VecDeque::with_capacity(num_vertices);
        let mut visited = HashSet::with_capacity(num_vertices);
        let mut nation_borders: HashMap<_, HashSet<_>> = Default::default();

        // outer loop set up the forest
        for u_idx in 0..num_vertices {
            let u_vertex = VertexId::from_usize(u_idx);
            let u_vertex_id = PlanetVertexId::new(&self.planets, planet_id, u_vertex);
            let u_city_id = self.vertex_idx_to_city_id[u_vertex_id];
            let city = &self.cities[u_city_id];
            // only interested in own nation's territory
            if city
                .controller
                .map_or(true, |controller| controller != nation_id)
            {
                continue;
            }

            // is previously visited
            if visited.replace(u_vertex).is_some() {
                continue;
            }

            // breadth-first search for one vertex (u)
            worklist.push_back((u_vertex, city));
            while !worklist.is_empty() {
                let (cur_vertex_id, city) = worklist.pop_front().unwrap();

                assert!(city
                    .controller
                    .map_or(false, |controller| controller == nation_id));

                // keep looking for the borders

                for &PlanetEdge {
                    vertex_id: neighbour_vertex_id,
                    ..
                } in &planet[cur_vertex_id]
                {
                    if visited.replace(neighbour_vertex_id).is_some() {
                        continue;
                    }
                    // not visited

                    let neighbour_planet_vertex_id =
                        PlanetVertexId::new(&self.planets, planet_id, neighbour_vertex_id);
                    let neighbour_city_id = self.vertex_idx_to_city_id[neighbour_planet_vertex_id];
                    let neighbour_city = &self.cities[neighbour_city_id];

                    if let Some(controller) = neighbour_city.controller {
                        if controller == nation_id {
                            // neighbour city is not a border province
                            worklist.push_back((neighbour_vertex_id, neighbour_city));
                        } else {
                            nation_borders
                                .entry(controller)
                                .or_default()
                                .insert(neighbour_vertex_id);
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
        start_vertex: VertexId,
        goal_vertex: VertexId,
    ) -> Option<Vec<VertexId>> {
        let VertexId(start) = start_vertex;

        let planet = &self.planets[planet_id];

        // dist[node] = current shortest distance from `start` to `node`
        use std::u32::MAX;
        let num_vertices = planet.num_vertices();
        let mut dist = vec![MAX; num_vertices];
        let mut prev = vec![None; num_vertices];

        let mut heap = BinaryHeap::new();

        // We're at `start`, with a zero cost
        dist[start as usize] = 0;
        heap.push(State {
            cost: 0,
            position: start_vertex,
        });

        // Examine the frontier with lower cost nodes first (min-heap)
        while let Some(State { cost, position }) = heap.pop() {
            // Alternatively we could have continued to find all shortest paths
            if position == goal_vertex {
                let mut cur = Some(goal_vertex);
                let mut ret = Vec::with_capacity(num_vertices / 10);
                loop {
                    let node = cur.expect("a path is already found, so cur cannot be None");
                    ret.push(node);

                    if node == start_vertex {
                        return Some(ret);
                    }
                    let VertexId(vertex_idx) = node;
                    cur = prev[vertex_idx as usize];
                }
            }

            // Important as we may have already found a better way
            let VertexId(position_idx) = position;
            if cost > dist[position_idx as usize] {
                continue;
            }

            // For each node we can reach, see if we can find a way with
            // a lower cost going through this node
            for edge in planet[position]
                .iter()
                .filter(|&PlanetEdge { vertex_id, .. }| {
                    self.can_nation_enter(
                        nation_id,
                        PlanetVertexId::new(&self.planets, planet_id, *vertex_id),
                        is_civilian,
                    )
                }) {
                let next = State {
                    cost: cost + edge.cost,
                    position: edge.vertex_id,
                };

                let VertexId(next_idx) = next.position;

                // If so, add it to the frontier and continue
                if next.cost < dist[next_idx as usize] {
                    heap.push(next);
                    // Relaxation, we have now found a better way
                    dist[next_idx as usize] = next.cost;
                    prev[next_idx as usize] = Some(position);
                }
            }
        }

        None
    }
}

#[wasm_bindgen]
impl Galaxy {
    pub fn interop_search_neighbour_nations(&self, planet_idx: u16, nation_idx: u16) -> JsValue {
        let planet_id = PlanetId::new(&self.planets, planet_idx);
        let nation_id = NationId::new(self, nation_idx);
        let ret = self.search_neighbour_nations(planet_id, nation_id);
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn has_division(&self, planet_idx: u16, vertex_idx: usize) -> bool {
        let planet_id = PlanetId::new(&self.planets, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        let planet_vertex_id = PlanetVertexId::new(&self.planets, planet_id, vertex_id);
        !self.stationed_divisions[planet_vertex_id].is_empty()
    }

    pub fn get_planet_vertices_coors(&self, planet_id: usize) -> Vec<f32> {
        let planet = &self.planets[planet_id];
        planet.city_coors.clone()
    }

    pub fn get_planet_path(
        &self,
        planet_idx: u16,
        nation_idx: u16,
        is_civilian: bool,
        start: usize,
        goal: usize,
    ) -> Vec<u8> {
        let planet_id = PlanetId::new(&self.planets, planet_idx);
        let nation_id = NationId::new(self, nation_idx);
        let start = VertexId::from_usize(start);
        let goal = VertexId::from_usize(goal);
        self.shortest_path(planet_id, nation_id, is_civilian, start, goal)
            .unwrap_or_default()
            .into_iter()
            .map(|VertexId(idx)| idx)
            .collect()
    }

    pub fn get_planet_edges(&self, planet_id: usize) -> Vec<u8> {
        let planet = &self.planets[planet_id];
        let PlanetAdjList(adj_list) = &planet.adj_list;
        let mut ret = Vec::with_capacity(MAX_VERTEX_DEGREE * adj_list.len());

        for (u_idx, vs) in adj_list.iter().enumerate() {
            let u = VertexId::from_usize(u_idx);
            for &PlanetEdge { vertex_id: v, .. } in vs {
                if u < v {
                    let VertexId(v_idx) = v;
                    ret.push(u_idx as u8);
                    ret.push(v_idx);
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

        let PlanetAdjList(adj_list) = &planet.adj_list;
        for (u, vs) in adj_list.iter().enumerate() {
            let u_vertex = VertexId::from_usize(u);
            for &PlanetEdge {
                vertex_id: v_vertex,
                ..
            } in vs
            {
                if u_vertex > v_vertex {
                    continue;
                }

                let VertexId(v) = v_vertex;
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
