use ArtilleryVariant;
use EquipmentVariant;
use LogisticsVariant;
use MeleeVariant;
use PowerArmourVariant;
use RangeVariant;
use TankVariant;

// all variants are ordered by (tech, sum of variant points) in descending order

impl EquipmentVariant for MeleeVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.reach as usize
            + self.sharpness as usize
            + self.consumption as usize
    }
}

impl EquipmentVariant for RangeVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.range as usize
            + self.precision as usize
            + self.ammunition as usize
            + self.consumption as usize
    }
}

impl EquipmentVariant for ArtilleryVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.range as usize
            + self.shell as usize
            + self.payload as usize
            + self.consumption as usize
    }
}

impl EquipmentVariant for TankVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.armor as usize
            + self.breakthrough as usize
            + self.consumption as usize
    }
}

impl EquipmentVariant for PowerArmourVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.armor as usize
            + self.breakthrough as usize
            + self.consumption as usize
    }
}

impl EquipmentVariant for LogisticsVariant {
    fn sum(&self) -> usize {
        self.durability as usize
            + self.armor as usize
            + self.capacity as usize
            + self.breakthrough as usize
            + self.consumption as usize
            + self.mobility as usize
    }
}
