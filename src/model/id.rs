use std::collections::HashSet;
use std::ops::{Index, IndexMut};
use *;

impl DivisionId {
    pub fn new(galaxy: &Galaxy, idx: usize) -> Self {
        assert!(idx < galaxy.divisions.len());
        Self(idx)
    }
}

impl Index<DivisionId> for Vec<Division> {
    type Output = Division;

    fn index(&self, DivisionId(idx): DivisionId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl IndexMut<DivisionId> for Vec<Division> {
    fn index_mut<'a>(&'a mut self, DivisionId(idx): DivisionId) -> &'a mut Self::Output {
        &mut self[idx as usize]
    }
}

impl DivisionTemplateId {
    pub fn new(galaxy: &Galaxy, idx: usize) -> Self {
        assert!(idx < galaxy.division_templates.len());
        Self(idx)
    }
}

impl Index<DivisionTemplateId> for Vec<DivisionTemplate> {
    type Output = DivisionTemplate;

    fn index(&self, DivisionTemplateId(idx): DivisionTemplateId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl CityId {
    pub fn new(galaxy: &Galaxy, idx: u32) -> Self {
        assert!((idx as usize) < galaxy.cities.len());
        Self(idx)
    }

    pub fn from_usize(galaxy: &Galaxy, idx: usize) -> Self {
        use std::u32::MAX;
        assert!(idx < (MAX as usize));
        Self::new(galaxy, idx as u32)
    }
}

impl Index<CityId> for CityIdToVertex {
    type Output = PlanetVertexId;

    fn index(&self, CityId(idx): CityId) -> &Self::Output {
        let Self(mapping) = self;
        &mapping[idx as usize]
    }
}

impl IndexMut<CityId> for CityIdToVertex {
    fn index_mut<'a>(&'a mut self, CityId(idx): CityId) -> &'a mut Self::Output {
        let Self(mapping) = self;
        &mut mapping[idx as usize]
    }
}

impl FleetId {
    pub fn new(galaxy: &Galaxy, idx: usize) -> Self {
        assert!((idx as usize) < galaxy.fleets.len());
        Self(idx)
    }

    pub fn from_usize(galaxy: &Galaxy, idx: usize) -> Self {
        Self::new(galaxy, idx)
    }
}

impl Index<FleetId> for Vec<Fleet> {
    type Output = Fleet;

    fn index(&self, FleetId(idx): FleetId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl IndexMut<FleetId> for Vec<Fleet> {
    fn index_mut<'a>(&'a mut self, FleetId(idx): FleetId) -> &'a mut Self::Output {
        &mut self[idx as usize]
    }
}

impl Index<CityId> for Vec<City> {
    type Output = City;

    fn index(&self, CityId(idx): CityId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl IndexMut<CityId> for Vec<City> {
    fn index_mut<'a>(&'a mut self, CityId(idx): CityId) -> &'a mut Self::Output {
        &mut self[idx as usize]
    }
}

impl NationId {
    pub fn new(galaxy: &Galaxy, idx: u16) -> Self {
        assert!(idx < (galaxy.nations.len() as u16));
        Self(idx)
    }
}

impl Index<NationId> for Vec<Nation> {
    type Output = Nation;

    fn index(&self, NationId(idx): NationId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl IndexMut<NationId> for Vec<Nation> {
    fn index_mut<'a>(&'a mut self, NationId(idx): NationId) -> &'a mut Self::Output {
        &mut self[idx as usize]
    }
}

impl Index<NationId> for Vec<Foreign> {
    type Output = Foreign;

    fn index(&self, NationId(idx): NationId) -> &Self::Output {
        &self[idx as usize]
    }
}

impl IndexMut<NationId> for Vec<Foreign> {
    fn index_mut<'a>(&'a mut self, NationId(idx): NationId) -> &'a mut Self::Output {
        &mut self[idx as usize]
    }
}

impl PlanetId {
    pub fn new(planets: &Vec<Planet>, idx: u16) -> Self {
        assert!((idx as usize) < planets.len());
        Self(idx)
    }

    pub fn from_usize(planets: &Vec<Planet>, idx: usize) -> Self {
        use std::u16::MAX;
        assert!(idx < (MAX as usize));
        Self::new(planets, idx as u16)
    }

    pub fn wrap_usize(idx: usize) -> Self {
        use std::u16::MAX;
        assert!(idx < (MAX as usize));
        Self(idx as u16)
    }
}

impl Index<PlanetId> for Vec<Planet> {
    type Output = Planet;

    fn index(&self, id: PlanetId) -> &Self::Output {
        let PlanetId(idx) = id;
        &self[idx as usize]
    }
}

impl IndexMut<PlanetId> for Vec<Planet> {
    fn index_mut<'a>(&'a mut self, id: PlanetId) -> &'a mut Self::Output {
        let PlanetId(idx) = id;
        &mut self[idx as usize]
    }
}

impl StarId {
    pub fn new(galaxy: &Galaxy, idx: u16) -> Self {
        assert!((idx as usize) < (galaxy.planets.len()));
        Self(idx)
    }

    pub fn from_usize(galaxy: &Galaxy, idx: usize) -> Self {
        use std::u16::MAX;
        assert!(idx < (MAX as usize));
        Self::new(galaxy, idx as u16)
    }

    pub fn wrap_usize(idx: usize) -> Self {
        use std::u16::MAX;
        assert!(idx < (MAX as usize));
        Self(idx as u16)
    }
}

impl Index<StarId> for Vec<Star> {
    type Output = Star;

    fn index(&self, id: StarId) -> &Self::Output {
        let StarId(idx) = id;
        &self[idx as usize]
    }
}

impl IndexMut<StarId> for Vec<Star> {
    fn index_mut<'a>(&'a mut self, id: StarId) -> &'a mut Self::Output {
        let StarId(idx) = id;
        &mut self[idx as usize]
    }
}

impl PlanetVertexId {
    pub fn new(planets: &Vec<Planet>, planet_id: PlanetId, vertex_id: VertexId) -> Self {
        let planet = &planets[planet_id];
        assert!(vertex_id.to_usize() < planet.num_vertices());

        Self {
            planet_id,
            vertex_id,
        }
    }

    pub fn from_usize(planets: &Vec<Planet>, planet_idx: usize, vertex_idx: usize) -> Self {
        let planet_id = PlanetId::from_usize(planets, planet_idx);
        let vertex_id = VertexId::from_usize(vertex_idx);
        Self::new(planets, planet_id, vertex_id)
    }
}

impl Index<PlanetVertexId> for VertexToCityId {
    type Output = CityId;

    fn index(
        &self,
        PlanetVertexId {
            planet_id: PlanetId(planet_idx),
            vertex_id: VertexId(vertex_idx),
        }: PlanetVertexId,
    ) -> &Self::Output {
        let VertexToCityId(data) = self;
        &data[planet_idx as usize][vertex_idx as usize]
    }
}

impl Index<PlanetVertexId> for StationedDivisions {
    type Output = HashSet<DivisionId>;

    fn index(
        &self,
        PlanetVertexId {
            planet_id: PlanetId(planet_idx),
            vertex_id: VertexId(vertex_idx),
        }: PlanetVertexId,
    ) -> &Self::Output {
        let StationedDivisions(data) = self;
        &data[planet_idx as usize][vertex_idx as usize]
    }
}

impl IndexMut<PlanetVertexId> for StationedDivisions {
    fn index_mut<'a>(
        &'a mut self,
        PlanetVertexId {
            planet_id: PlanetId(planet_idx),
            vertex_id: VertexId(vertex_idx),
        }: PlanetVertexId,
    ) -> &'a mut Self::Output {
        let StationedDivisions(data) = self;
        &mut data[planet_idx as usize][vertex_idx as usize]
    }
}

impl VertexId {
    pub fn from_usize(idx: usize) -> Self {
        use std::u8::MAX;
        assert!(idx < (MAX as usize));
        Self(idx as u8)
    }

    pub fn to_usize(&self) -> usize {
        let &Self(idx) = self;
        idx as usize
    }
}

impl Index<VertexId> for Planet {
    type Output = Vec<PlanetEdge>;

    fn index(&self, VertexId(idx): VertexId) -> &Self::Output {
        &self.adj_list.0[idx as usize]
    }
}

impl Index<TransporterId> for Vec<Transporter> {
    type Output = Transporter;

    fn index(&self, TransporterId(idx): TransporterId) -> &Self::Output {
        &self[idx]
    }
}

impl IndexMut<TransporterId> for Vec<Transporter> {
    fn index_mut<'a>(&'a mut self, TransporterId(idx): TransporterId) -> &'a mut Self::Output {
        &mut self[idx]
    }
}
