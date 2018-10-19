use ordered_float::NotNan;
use rand::Rng;
use std::ops::Sub;
use wbg_rand;

#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct CartesianCoor {
    x: NotNan<f32>,
    y: NotNan<f32>,
}

#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct PolarCoor {
    r: NotNan<f32>,
    θ: NotNan<f32>,
}

impl PolarCoor {
    pub fn new(r: f32, θ: f32) -> Self {
        assert!(!r.is_infinite());
        assert!(!θ.is_infinite());
        let r = match NotNan::new(r) {
            Ok(r) => r,
            Err(msg) => panic!(msg),
        };
        let θ = match NotNan::new(θ) {
            Ok(θ) => θ,
            Err(msg) => panic!(msg),
        };
        PolarCoor { r, θ }
    }

    pub fn random_point_in_circle(rng: &mut impl Rng, r_limit: f32) -> Self {
        // https://programming.guide/random-point-within-circle.html
        use std::f32::consts::PI;
        let θ = rng.gen::<f32>() * 2. * PI;
        let r = r_limit * rng.gen::<f32>().sqrt();
        PolarCoor::new(r, θ)
    }

    // somehow wbg_rand::wasm_rng isn't treated as rand::Rng...
    pub fn random_point_in_circle_js(rng: &mut impl wbg_rand::Rng, r_limit: f32) -> Self {
        // https://programming.guide/random-point-within-circle.html
        use std::f32::consts::PI;
        let θ = rng.gen::<f32>() * 2. * PI;
        let r = r_limit * rng.gen::<f32>().sqrt();
        PolarCoor::new(r, θ)
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
}

impl CartesianCoor {
    pub fn new(x: f32, y: f32) -> Self {
        assert!(!x.is_infinite());
        assert!(!y.is_infinite());
        let x = match NotNan::new(x) {
            Ok(x) => x,
            Err(msg) => panic!(msg),
        };
        let y = match NotNan::new(y) {
            Ok(y) => y,
            Err(msg) => panic!(msg),
        };
        CartesianCoor { x, y }
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
        let CartesianCoor { x, y } = self;
        x.hypot(y.into_inner())
    }

    pub fn to_pair(&self) -> (f32, f32) {
        let Self { x, y } = self;
        (x.into_inner(), y.into_inner())
    }
}

impl Sub for CartesianCoor {
    type Output = CartesianCoor;

    fn sub(self, other: CartesianCoor) -> CartesianCoor {
        let CartesianCoor { x: x1, y: y1 } = self;
        let CartesianCoor { x: x0, y: y0 } = other;
        CartesianCoor {
            x: x1 - x0,
            y: y1 - y0,
        }
    }
}
