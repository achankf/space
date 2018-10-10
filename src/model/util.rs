use nalgebra::geometry::Point2;
use std::hash::Hash;
use Galaxy;
use Locatable;
use Orbit;
use SortedEdge;
use LOC_DIM_MAX;
use LOC_HASH_FACTOR;

impl<T> SortedEdge<T>
where
    T: Copy + Clone + PartialOrd + Ord + PartialEq + Eq + Hash,
{
    pub fn new(u: T, v: T) -> Self {
        if u < v {
            SortedEdge(u, v)
        } else {
            SortedEdge(v, u)
        }
    }

    pub fn first(&self) -> T {
        let &SortedEdge(u, _) = self;
        u
    }

    pub fn second(&self) -> T {
        let &SortedEdge(_, v) = self;
        v
    }
}

pub(crate) fn cal_star_orbit_coor(orbit_radius: f32, angle: f32) -> Point2<f32> {
    cal_orbit_coor_helper(&Point2::origin(), orbit_radius, angle)
}

pub(crate) fn cal_orbit_coor(state: &Galaxy, orbit: &Orbit, angle: f32) -> Point2<f32> {
    let center = orbit.center;
    let orbit_radius = orbit.orbit_radius;

    match center {
        Locatable::Star(star_id) => {}
        _ => {}
    }

    let base_coor = state
        .locs
        .get(&center)
        .expect("orbit's center must have a location");

    return cal_orbit_coor_helper(base_coor, orbit_radius, angle);
}

pub(crate) fn cal_orbit_coor_helper(c: &Point2<f32>, orbit_radius: f32, angle: f32) -> Point2<f32> {
    let o: Point2<_> = Point2::new(orbit_radius * angle.cos(), orbit_radius * angle.sin());

    let new_p = c - o; // this returns a matrix...
    let ret = Point2::new(new_p.x, new_p.y);
    ret
}

// hash function for locations (2d vector)
pub(crate) fn loc_hash(p: &Point2<f32>) -> i32 {
    let s = p / LOC_HASH_FACTOR;
    let x = p.x;
    let y = p.y;
    let xi = (x / LOC_HASH_FACTOR).floor() as i32;
    let yi = (y / LOC_HASH_FACTOR).floor() as i32;
    loc_hash_scaled(&(xi, yi))
}

pub(crate) fn loc_hash_scaled((x, y): &(i32, i32)) -> i32 {
    assert!(x.abs() < LOC_DIM_MAX);
    assert!(y.abs() < LOC_DIM_MAX);
    (x << 16) + y
}

pub fn distance_point_segment(p: &Point2<f32>, v1: &Point2<f32>, v2: &Point2<f32>) -> f32 {
    // https://math.stackexchange.com/a/2250212

    let v1p_diff = v1 - p;
    let v2v1_diff = v2 - v1;

    let v2v1_norm = v2v1_diff.norm();

    let t = {
        let t_numerator = v1p_diff.dot(&v2v1_diff);
        let t_denominator = v2v1_norm * v2v1_norm; // norm-squared
        -1. * t_numerator / t_denominator
    };

    if t >= 0. && t <= 1. {
        let d_numerator = (v2v1_diff.x * v1p_diff.y - v2v1_diff.y * v1p_diff.x).abs(); // v2v1_diff.cross(&v1p_diff).norm(); only works for Point3
        let d_denominator = v2v1_norm;
        d_numerator / d_denominator
    } else {
        let d1 = (p - v1).norm();
        let d2 = (p - v2).norm();
        d1.min(d2)
    }
}
