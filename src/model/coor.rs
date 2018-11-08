use constants::TWO_PI;
use ordered_float::NotNan;
use rand::Rng;
use std::ops::{Add, Mul, Sub};
use wbg_rand;

#[derive(Debug, Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct CartesianCoor {
    x: NotNan<f32>,
    y: NotNan<f32>,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct PolarCoor {
    r: NotNan<f32>,
    θ: NotNan<f32>,
}

impl PolarCoor {
    pub fn new(r: f32, θ: f32) -> Self {
        assert!(!r.is_infinite());
        assert!(!θ.is_infinite());
        let r = NotNan::new(r).unwrap();
        let θ = NotNan::new(θ).unwrap();
        Self { r, θ }
    }

    pub fn random_point_in_circle(rng: &mut impl Rng, r_limit: f32) -> Self {
        // https://programming.guide/random-point-within-circle.html
        use std::f32::consts::PI;
        let θ = rng.gen::<f32>() * 2. * PI;
        let r = r_limit * rng.gen::<f32>().sqrt();
        Self::new(r, θ)
    }

    // somehow wbg_rand::wasm_rng isn't treated as rand::Rng...
    pub fn random_point_in_circle_js(rng: &mut impl wbg_rand::Rng, r_limit: f32) -> Self {
        // https://programming.guide/random-point-within-circle.html
        use std::f32::consts::PI;
        let θ = rng.gen::<f32>() * 2. * PI;
        let r = r_limit * rng.gen::<f32>().sqrt();
        Self::new(r, θ)
    }

    pub fn to_cartesian(&self) -> CartesianCoor {
        let r = self.r.into_inner();
        let θ = self.θ.into_inner();
        let (y, x) = θ.sin_cos(); // note: y comma x, not x comma y
        CartesianCoor::new(r * x, r * y)
    }

    pub fn to_pair(&self) -> (f32, f32) {
        let Self { r, θ } = self;
        (r.into_inner(), θ.into_inner())
    }

    pub fn get_angle(&self) -> f32 {
        self.θ.into_inner()
    }

    pub fn set_angle(&mut self, θ: f32) {
        self.θ = match NotNan::new(θ) {
            Ok(θ) => θ % TWO_PI,
            Err(msg) => panic!(msg),
        };
    }
}

impl CartesianCoor {
    pub fn new(x: f32, y: f32) -> Self {
        assert!(!x.is_infinite());
        assert!(!y.is_infinite());
        let x = NotNan::new(x).unwrap();
        let y = NotNan::new(y).unwrap();
        Self { x, y }
    }

    pub fn to_polar(&self, origin: Self) -> PolarCoor {
        // https://www.mathsisfun.com/polar-cartesian-coordinates.html
        let (x, y) = (*self - origin).to_pair();
        let r = x.hypot(y);
        let θ = y.atan2(x);
        PolarCoor::new(r, θ)
    }

    pub fn distance(&self, other: Self) -> f32 {
        (*self - other).norm()
    }

    pub fn norm(&self) -> f32 {
        let Self { x, y } = self;
        x.hypot(y.into_inner())
    }

    pub fn to_pair(&self) -> (f32, f32) {
        let Self { x, y } = self;
        (x.into_inner(), y.into_inner())
    }
}

impl Sub for CartesianCoor {
    type Output = Self;

    fn sub(self, other: Self) -> Self {
        let Self { x: x1, y: y1 } = self;
        let Self { x: x0, y: y0 } = other;
        Self {
            x: x1 - x0,
            y: y1 - y0,
        }
    }
}

impl Add for CartesianCoor {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        let Self { x: x1, y: y1 } = self;
        let Self { x: x0, y: y0 } = other;
        Self {
            x: x1 + x0,
            y: y1 + y0,
        }
    }
}

impl Mul<f32> for CartesianCoor {
    type Output = Self;

    fn mul(self, scalar: f32) -> Self {
        let Self { x: x1, y: y1 } = self;
        Self {
            x: x1 * scalar,
            y: y1 * scalar,
        }
    }
}
