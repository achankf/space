pub mod city;
pub mod industry;
pub mod industry_sector;

use enum_map::EnumMap;
use product::Product;

#[derive(Default)]
pub struct Industry(EnumMap<Product, IndustrySector>);

#[derive(Default)]
pub struct IndustrySector {
    pub scale: u32,
    pub employees: u32,
    pub operation_efficiency: u32,
    pub storage_scale: u32,
    pub tech_level: u32,

    // storage
    pub storage_qty: u32,
    pub in_transport_qty: u32,
}
