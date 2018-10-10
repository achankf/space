use std::collections::HashSet;
use std::ops::{Index, IndexMut};
use City;
use CityId;
use Division;
use DivisionId;
use DivisionTemplate;
use DivisionTemplateId;
use Foreign;
use Galaxy;
use Nation;
use NationId;
use Planet;
use PlanetId;
use PlanetVertexId;
use StationedDivisions;

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
    pub fn new(galaxy: &Galaxy, idx: u16) -> Self {
        assert!(idx < (galaxy.cities.len() as u16));
        Self(idx)
    }

    pub fn to_vertex_id(&self, galaxy: &Galaxy) -> PlanetVertexId {
        let &CityId(city_idx) = self;
        galaxy.city_idx_to_vertex_id[city_idx as usize]
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
    pub fn new(galaxy: &Galaxy, idx: u16) -> Self {
        assert!(idx < (galaxy.planets.len() as u16));
        Self(idx)
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

impl PlanetVertexId {
    pub fn new(galaxy: &Galaxy, planet_id: PlanetId, vertex_idx: u8) -> Self {
        let planet = &galaxy.planets[planet_id];
        assert!(vertex_idx < planet.cal_dimension());
        Self {
            planet_id,
            vertex_idx,
        }
    }

    pub fn to_city_id(&self, galaxy: &Galaxy) -> CityId {
        let Self {
            planet_id: PlanetId(planet_idx),
            vertex_idx,
        } = self;
        galaxy.vertex_idx_to_city_id[*planet_idx as usize][*vertex_idx as usize]
    }
}

impl Index<PlanetVertexId> for StationedDivisions {
    type Output = HashSet<DivisionId>;

    fn index(
        &self,
        PlanetVertexId {
            planet_id: PlanetId(planet_idx),
            vertex_idx,
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
            vertex_idx,
        }: PlanetVertexId,
    ) -> &'a mut Self::Output {
        let StationedDivisions(data) = self;
        &mut data[planet_idx as usize][vertex_idx as usize]
    }
}
