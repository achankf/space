use constants::CITY_CIRCLE_RADIUS;
use constants::MAX_STAR_RADIUS;
use constants::RADIUS_OF_LARGEST_OBJ_SQUARED;
use kdtree::distance::squared_euclidean;
use std::cmp::Ordering;
use std::collections::BinaryHeap;
use strsim::normalized_levenshtein;
use util::is_circle_rect_intersect;
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use FleetState;
use Galaxy;
use Id;
use Locatable;
use PlanetId;
use SpacecraftKind;
use StarId;

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

#[derive(Serialize, Deserialize)]
pub struct DrawFleetData {
    radius: f32,
    x: f32,
    y: f32,
}

#[derive(Default, Serialize, Deserialize)]
pub struct DrawGalaxyData {
    planets: Vec<DrawPlanetData>,
    stars: Vec<DrawStarData>,
    ships: Vec<DrawShipData>,
    fleets: Vec<DrawFleetData>,
}

#[wasm_bindgen]
impl Galaxy {
    pub fn interop_search(&self, x: f64, y: f64) -> JsValue {
        let ret: Vec<_> = self.search(x, y).collect();
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn interop_search_exact(&self, x: f64, y: f64) -> JsValue {
        let ret = self.search_exact(x, y);
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
        let ret = self.cal_draw_data(tlx, tly, brx, bry, grid_size);
        JsValue::from_serde(&ret).unwrap()
    }

    pub fn print_search(&self, x: f64, y: f64) -> Option<String> {
        self.search_exact(x, y)
            .and_then(|SearchResult { id, name }| match id {
                Locatable::Planet(planet_id) => {
                    let ret = format!("Planet: {}", name);
                    Some(ret)
                }
                Locatable::City(city_id) => {
                    let city = &self.cities[city_id];
                    let title = format!("{:=^132}", name);
                    let ret = format!("{}\n{}", title, city);
                    Some(ret)
                }
                _ => None,
            })
    }
}

impl Galaxy {
    pub fn search<'a>(&'a self, x: f64, y: f64) -> impl Iterator<Item = SearchResult> + 'a {
        let largest_radius = MAX_STAR_RADIUS as f64;
        let largest_radius_squared = largest_radius * largest_radius; // squared

        self.loc_idx
            .0
            .within(&[x, y], largest_radius_squared, &squared_euclidean)
            .expect("not handled")
            .into_iter()
            .filter_map(move |(distance_squared, &id)| {
                let (name, radius) = match id {
                    Locatable::Planet(planet_id) => {
                        let planet = &self.planets[planet_id];
                        (planet.name.to_string(), planet.radius)
                    }
                    Locatable::Star(star_id) => {
                        let star = &self.stars[star_id];
                        (star.name.to_string(), star.radius)
                    }
                    Locatable::City(id) => (format!("{:?}", id), CITY_CIRCLE_RADIUS),
                    Locatable::Fleet(id) => (format!("{:?}", id), 1.),
                };
                let radius = radius as f64;
                let radius_squared = radius * radius;
                if distance_squared <= radius_squared {
                    Some(SearchResult { id, name })
                } else {
                    None
                }
            })
    }

    pub fn search_exact(&self, x: f64, y: f64) -> Option<SearchResult> {
        self.search(x, y).into_iter().next()
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

        let reserve_size = self.stars.len() + self.planets.len(); // + self.nations.len();

        // partial sort in descending order by the Levenshtein distance
        let mut heap = BinaryHeap::from({
            let all_terms = stars
                .chain(planets)
                // .chain(nations)
                .map(|(id, name)| {
                    let lower = name.to_lowercase();
                    let lev = normalized_levenshtein(&target, &lower);
                    NameItem(NameResult { id, name }, lev)
                });
            let mut buffer = Vec::with_capacity(reserve_size);
            buffer.extend(all_terms);
            buffer
        });
        let num_take = max_show.min(heap.len());
        let mut ret = Vec::with_capacity(num_take);
        for _ in 0..num_take {
            let NameItem(result, _) = heap.pop().unwrap();
            ret.push(result);
        }

        ret
    }

    pub fn cal_draw_data(
        &self,
        tlx: f64, // top-left x
        tly: f64, // top-left y
        brx: f64, // bottom-right x
        bry: f64, // bottom-right y
        grid_size: f32,
    ) -> DrawGalaxyData {
        // rectangle is not a point
        assert!(tlx < brx);
        assert!(tly < bry);

        // center of the bounding bound (screen)
        let cx = (tlx + brx) / 2.;
        let cy = (tly + bry) / 2.;

        // perform a circle search
        let width = brx - tlx;
        let height = bry - tly;
        let radius_squared = {
            let hypotenuse_squared = width * width + height * height;

            // radius = hypotenuse / 2
            // so, radius squared = hypotenuse squared / 4
            let radius_squared = hypotenuse_squared / 4.;

            // make sure all objects of different sizes are shown, if zooming too close
            radius_squared.max(RADIUS_OF_LARGEST_OBJ_SQUARED as f64)
        };

        self.loc_idx
            .0
            .within(&[cx, cy], radius_squared, &squared_euclidean)
            .expect("not handled")
            .into_iter()
            // refine search
            .fold(DrawGalaxyData::default(), |mut acc, (_, &id)| {
                match id {
                    Locatable::Fleet(fleet_id) => {
                        let fleet = &self.fleets[fleet_id];
                        let (x, y) = match fleet.state {
                            FleetState::Ready(coor) => coor,
                            FleetState::Travel(coor, _) => coor,
                            _ => {
                                unimplemented!();
                            }
                        }
                        .to_pair();

                        acc.fleets.push(DrawFleetData {
                            radius: 1.,
                            x: x.into(),
                            y: y.into(),
                        });
                    }
                    Locatable::City(_) => {
                        // handled somewhere else for now
                    }
                    Locatable::Star(star_id) => {
                        let star = &self.stars[star_id];
                        let (x, y) = star.coor.to_cartesian().to_pair();

                        let is_intersect = is_circle_rect_intersect(
                            (x.into(), y.into(), star.radius.into()),
                            (tlx, tly, brx, bry),
                        );

                        if !is_intersect {
                            return acc;
                        }

                        acc.stars.push(DrawStarData {
                            name: star.name.clone(),
                            radius: star.radius,
                            x: x.into(),
                            y: y.into(),
                        });
                    }
                    Locatable::Planet(planet_id) => {
                        let planet = &self.planets[planet_id];
                        let PlanetId(planet_idx) = planet_id;
                        let planet_radius = planet.radius;

                        // TODO this is a hack to reduce the number of results to be serialized
                        let vp_radius = grid_size * planet_radius; // stands for viewport radius
                        if vp_radius < 1.0 {
                            return acc;
                        }

                        let star = &self.stars[planet.star_system];

                        let c = star.coor.to_cartesian();
                        let (cx, cy) = c.to_pair();
                        let (x, y) = (planet.coor.to_cartesian() + c).to_pair();
                        let radius = planet.radius;

                        let is_intersect = is_circle_rect_intersect(
                            (x.into(), y.into(), radius.into()),
                            (tlx, tly, brx, bry),
                        );

                        if !is_intersect {
                            return acc;
                        }

                        acc.planets.push(DrawPlanetData {
                            idx: planet_idx,
                            name: planet.name.clone(),
                            radius,
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
