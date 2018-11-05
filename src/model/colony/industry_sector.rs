use colony::IndustrySector;
use std::collections::HashMap;
use std::fmt;
use PlanetVertexId;

impl IndustrySector {
    pub fn consume_exact(&mut self, consume_qty: u32) {
        assert!(consume_qty <= self.storage_qty);
        self.storage_qty -= consume_qty;
    }

    pub fn produce(&mut self, qty: u32) {
        self.storage_qty += qty;
    }

    /// returns the number of goods consumed
    pub fn try_consume(&mut self, consume_qty: u32) -> u32 {
        if self.storage_qty <= consume_qty {
            let consumed_qty = self.storage_qty;
            self.storage_qty = 0;
            consumed_qty
        } else {
            self.storage_qty -= consume_qty;
            consume_qty
        }
    }
}

impl fmt::Display for IndustrySector {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{:>15} {:>15} {:>15} {:>15} {:>15} {:>15} {:>15}",
            self.scale,
            self.employees,
            self.operation_efficiency,
            self.tech_level,
            self.storage_scale,
            self.storage_qty,
            self.in_transport_qty
        )
    }
}
