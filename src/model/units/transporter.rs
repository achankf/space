use PlanetVertexId;
use Product;
use VertexId;

pub enum TransporterState {
    LoadGoods {
        current_vertex: VertexId,
        destination: VertexId,
    },
    UnloadGoods {
        current_vertex: VertexId,
    },
    Move {
        src_vertex: VertexId,
        destination: VertexId,
        moved: u32, // length moved away from the current vertex, to the destination
    },
    Station {
        current_vertex: VertexId,
        prev_product_kind: Option<Product>, // avoid re-transporting the same goods again
    },
}

pub struct Transporter {
    pub people: u32,
    pub cargo: (Product, u32),
    pub home_vertex: PlanetVertexId,
    pub state: TransporterState,
}
