use kdtree::distance::squared_euclidean;
use nalgebra::geometry::Point2;
use std::cmp::Ordering;
use std::collections::BinaryHeap;
use strsim::normalized_levenshtein;
use util::is_circle_rect_intersect;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use CorporationId;
use Galaxy;
use Id;
use Locatable;
use LocationIndex;
use NationId;
use PlanetId;
use SpacecraftKind;
use StarId;
use RADIUS_OF_LARGEST_OBJ;
use RADIUS_OF_LARGEST_OBJ_SQUARED;

#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    id: Locatable,
    name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NameResult {
    id: Id,
    name: String,
}

#[derive(Serialize, Deserialize)]
pub struct DrawStarData {
    name: String,
    radius: f32,
    x: f64,
    y: f64,
}

#[derive(Serialize, Deserialize)]
pub struct DrawPlanetData {
    idx: u16,
    name: String,
    radius: f32,
    x: f64,
    y: f64,
    cx: f64,
    cy: f64,
}

#[derive(Serialize, Deserialize)]
pub struct DrawShipData {
    kind: SpacecraftKind,
    radius: f32,
    x: f32,
    y: f32,
}

#[derive(Default, Serialize, Deserialize)]
pub struct DrawGalaxyData {
    planets: Vec<DrawPlanetData>,
    stars: Vec<DrawStarData>,
    ships: Vec<DrawShipData>,
}

impl Galaxy {
    pub fn search(&self, p1: &Point2<f32>) -> Vec<SearchResult> {
        /*
        let x1 = p1.x;
        let y1 = p1.y;
        let fx = (x1 / LOC_HASH_FACTOR).floor() as i32;
        let fy = (y1 / LOC_HASH_FACTOR).floor() as i32;
        
        // search the location with an oversized rectangle
        let startx = fx - 1;
        let starty = fy - 1;
        let limitx = fx + 1;
        let limity = fy + 1;
        
        let result = self.search_range_helper(startx, starty, limitx, limity);
        let result_len = result.len();
        
        result
            .into_iter()
            // .filter(|id| match id {
            //     Locatable::Planet(_) | Locatable::Star(_) => true,
            //     _ => false,
            // })
            .fold(Vec::with_capacity(result_len), |mut acc, id| {
                let (name, radius) = match id {
                    Locatable::Planet(PlanetId(idx)) => {
                        let planet = &self.planets[idx as usize];
                        (planet.name.to_string(), planet.orbit.radius)
                    }
                    Locatable::Star(StarId(idx)) => {
                        let star = &self.stars[idx as usize];
                        (star.name.to_string(), star.radius)
                    }
                };
        
                let p2 = self
                    .locs
                    .get(&id)
                    .expect("search_helper: map object should have a location");
        
                let dist = (p2 - p1).norm();
                if dist <= radius {
                    acc.push(SearchResult { id, name });
                }
                acc
            })
            */
        Vec::new()
    }

    pub fn search_name(&self, target: &str) -> Vec<NameResult> {
        let max_show = 100; // TODO make this configurable by the UI
        assert!(max_show > 0);

        let target = target.to_lowercase();

        let stars = self
            .stars
            .iter()
            .enumerate()
            .map(|(i, star)| (Id::Star(StarId(i as u16)), star.name.to_string()));

        let planets = self
            .planets
            .iter()
            .enumerate()
            .map(|(i, planet)| (Id::Planet(PlanetId(i as u16)), planet.name.to_string()));

        /*
        let nations = self
            .nations
            .iter()
            .enumerate()
            .map(|(i, nation)| (Id::Nation(NationId(i)), nation.name.to_string()));
            */

        let all_terms = stars
            .chain(planets)
            // .chain(nations)
            .map(|(id, name)| {
                let lower = name.to_lowercase();
                let lev = normalized_levenshtein(&target, &lower);
                NameItem(NameResult { id, name }, lev)
            });

        // TODO use collect_into() when it lands
        let reserve = self.stars.len() + self.planets.len(); // + self.nations.len();
        let mut matches: Vec<NameItem> = Vec::with_capacity(reserve);
        for term in all_terms {
            matches.push(term);
        }

        // partial sort in descending order by the Levenshtein distance
        let mut heap = BinaryHeap::from(matches);
        let num_take = max_show.min(heap.len());
        let mut ret = Vec::with_capacity(num_take);
        for _ in 0..num_take {
            let NameItem(result, _) = heap.pop().unwrap();
            ret.push(result);
        }

        ret
    }

    pub fn cal_draw_data_helper(
        &self,
        tlx: f64, // top-left x
        tly: f64, // top-left y
        brx: f64, // bottom-right x
        bry: f64, // bottom-right y
        grid_size: f32,
    ) -> DrawGalaxyData {
        let LocationIndex(data) = &self.loc_idx;

        // rectangle is not a point
        assert!(tlx < brx);
        assert!(tly < bry);

        // center of the bounding bound (screen)
        let cx = (tlx + brx) / 2.;
        let cy = (tly + bry) / 2.;

        // perform a circle search
        let width = brx - tlx;
        let height = bry - tly;
        let radius_squared =
            (width * width + height * height).max(RADIUS_OF_LARGEST_OBJ_SQUARED as f64); // radius is the hypotenuse; hence search will overestimate

        data.within(&[cx, cy], radius_squared, &squared_euclidean)
            .expect("not handled")
            .into_iter()
            // refine search
            .fold(DrawGalaxyData::default(), |mut acc, (_, &id)| {
                match id {
                    Locatable::Star(StarId(idx)) => {
                        let star = &self.stars[idx as usize];
                        let (x, y) = self
                            .locs
                            .get(&id)
                            .expect("star must have a location")
                            .clone();

                        let is_intersect =
                            is_circle_rect_intersect((x, y, star.radius), (tlx, tly, brx, bry));

                        if !is_intersect {
                            return acc;
                        }

                        acc.stars.push(DrawStarData {
                            name: star.name.clone(),
                            radius: star.radius,
                            x,
                            y,
                        });
                    }
                    Locatable::Planet(PlanetId(idx)) => {
                        let planet = &self.planets[idx as usize];
                        let orbit = &planet.orbit;

                        // TODO this is a hack to reduce the number of results to be serialized
                        let vp_radius = grid_size * orbit.radius; // stands for viewport radius
                        if vp_radius < 1.0 {
                            return acc;
                        }

                        let (x, y) = self
                            .locs
                            .get(&id)
                            .expect("star must have a location")
                            .clone();

                        let (cx, cy) = self
                            .locs
                            .get(&orbit.center)
                            .expect("star must have a location")
                            .clone();

                        let is_intersect =
                            is_circle_rect_intersect((x, y, orbit.radius), (tlx, tly, brx, bry));

                        if !is_intersect {
                            return acc;
                        }

                        acc.planets.push(DrawPlanetData {
                            idx,
                            name: planet.name.clone(),
                            radius: orbit.radius,
                            x,
                            y,
                            cx,
                            cy,
                        });
                    }
                };
                acc
            })
    }
}

impl Galaxy {
    /*
    fn search_range_helper(
        &self,
        startx: i32,
        starty: i32,
        limitx: i32,
        limity: i32,
    ) -> Vec<Locatable> {
        assert!(startx <= limitx);
        assert!(starty <= limity);
    
        (startx..=limitx)
            .flat_map(|x| {
                let ret: Vec<_> = (starty..=limity)
                    .map(|y| loc_hash_scaled(&(x.clone(), y)))
                    .filter_map(|hash| self.loc_idx.get(&hash))
                    .flatten()
                    .cloned()
                    .collect();
                ret
            })
            .collect()
    }
    */
}

// boilerplate codes for binary heap
#[derive(Debug)]
struct NameItem(NameResult, f64);

impl Ord for NameItem {
    fn cmp(&self, other: &NameItem) -> Ordering {
        self.partial_cmp(other).expect("cannot compare floats")
    }
}

impl PartialEq for NameItem {
    fn eq(&self, other: &NameItem) -> bool {
        let NameItem(_, v1) = self;
        let NameItem(_, v2) = other;
        v1.eq(v2)
    }
}

impl Eq for NameItem {}

impl PartialOrd for NameItem {
    fn partial_cmp(&self, other: &NameItem) -> Option<Ordering> {
        let NameItem(_, v1) = self;
        let NameItem(_, v2) = other;
        v1.partial_cmp(v2)
    }
}
