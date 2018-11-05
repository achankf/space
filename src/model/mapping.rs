use {CityId, Galaxy, PlanetVertexId};

impl Galaxy {
    pub fn to_vertex_id(&self, city_id: CityId) -> PlanetVertexId {
        self.city_id_to_vertex_id[city_id]
    }

    pub fn to_city_id(&self, vertex_id: PlanetVertexId) -> CityId {
        self.vertex_idx_to_city_id[vertex_id]
    }
}
