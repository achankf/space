use nalgebra::geometry::Point2;
use std::hash::Hash;
use wbg_rand::{Rng, WasmRng};
use Galaxy;
use Locatable;
use SortedEdge;

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

pub fn is_circle_rect_intersect(
    (cx, cy, radius): (f64, f64, f32),
    (tlx, tly, brx, bry): (f64, f64, f64, f64),
) -> bool {
    // https://yal.cc/rectangle-circle-intersection-test/
    let dx = cx - tlx.max(cx.min(brx));
    let dy = cy - tly.max(cy.min(bry));
    let r_squared = radius as f64 * radius as f64;
    (dx * dx + dy * dy) < r_squared
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
