use EnumMap;
use Product;
use ProductMapU;

impl Product {
    pub fn base_demands() -> EnumMap<Product, ProductMapU> {
        enum_map!{
            Product::Food => enum_map!{Product::Crop => 4, _ => 0},
            _ =>  EnumMap::default(), // TODO
        }
    }

    pub fn sum_by_ref(m1: &ProductMapU, m2: &ProductMapU) -> ProductMapU {
        m2.iter()
            .fold(EnumMap::default(), |mut acc, (product, m2_qty)| {
                acc[product] = m1[product] + m2_qty;
                acc
            })
    }

    pub fn sum(mut m1: ProductMapU, m2: &ProductMapU) -> ProductMapU {
        for (product, qty) in m2 {
            m1[product] += qty;
        }
        m1
    }

    pub fn to_raw_u32_arr(v: ProductMapU) -> Vec<u32> {
        // TODO collect_into()
        let mut ret = vec![0; v.len()];

        for (product, qty) in v {
            ret[product as usize] = qty;
        }
        // v.into_iter().map(|(_, qty)| qty).collect()
        ret
    }
}
