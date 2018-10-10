use loc_hash_scaled;
use nalgebra::geometry::Point2;
use std::cmp::Ordering;
use std::collections::BinaryHeap;
use strsim::normalized_levenshtein;
use CorporationId;
use Galaxy;
use Id;
use Locatable;
use NationId;
use PlanetId;
use SpacecraftKind;
use StarId;
use LOC_HASH_FACTOR;

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
    x: f32,
    y: f32,
}

#[derive(Serialize, Deserialize)]
pub struct DrawPlanetData {
    name: String,
    radius: f32,
    x: f32,
    y: f32,
    cx: f32,
    cy: f32,
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
        tlx: f32,
        tly: f32,
        brx: f32,
        bry: f32,
        grid_size: f32,
    ) -> DrawGalaxyData {
        // floored
        let startx = (tlx / LOC_HASH_FACTOR).floor() as i32;
        let starty = (tly / LOC_HASH_FACTOR).floor() as i32;

        // ceiled
        let limitx = (brx / LOC_HASH_FACTOR).ceil() as i32;
        let limity = (bry / LOC_HASH_FACTOR).ceil() as i32;

        self.search_range_helper(startx, starty, limitx, limity)
            .into_iter()
            .fold(DrawGalaxyData::default(), |mut acc, id| {
                match id {
                    Locatable::Star(StarId(idx)) => {
                        let star = &self.stars[idx as usize];
                        let p = self
                            .locs
                            .get(&id)
                            .expect("star must have a location")
                            .clone();
                        acc.stars.push(DrawStarData {
                            name: star.name.clone(),
                            radius: star.radius,
                            x: p.x,
                            y: p.y,
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

                        let p = self
                            .locs
                            .get(&id)
                            .expect("star must have a location")
                            .clone();

                        let c = self
                            .locs
                            .get(&orbit.center)
                            .expect("star must have a location")
                            .clone();

                        acc.planets.push(DrawPlanetData {
                            name: planet.name.clone(),
                            radius: orbit.radius,
                            x: p.x,
                            y: p.y,
                            cx: c.x,
                            cy: c.y,
                        });
                    }
                };
                acc
            })
    }
}

impl Galaxy {
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
