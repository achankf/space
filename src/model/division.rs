use std::ops::{Index, IndexMut};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use AccessRight;
use CityId;
use CombatStyle;
use Division;
use DivisionId;
use DivisionLocation;
use DivisionTemplate;
use DivisionTemplateId;
use Galaxy;
use NationId;
use PlanetId;
use PlanetVertexId;
use SquadKind;

#[wasm_bindgen]
impl Galaxy {
    pub fn add_division_template(
        &mut self,
        squads: JsValue,
        style: CombatStyle,
        is_civilian: bool,
    ) {
        let squads: Vec<SquadKind> = squads.into_serde().expect("cannot parse squads");
        let has_colonist = squads.iter().find(|&x| *x == SquadKind::Colonist).is_some();
        let template = DivisionTemplate {
            squads,
            style,
            is_civilian,
            has_colonist,
        };
        self.division_templates.push(template);
    }

    pub fn get_division_template(&self, template_idx: usize) -> JsValue {
        let template = &self.division_templates[template_idx];
        JsValue::from_serde(&template).unwrap()
    }

    pub fn train_division(&mut self, template_idx: usize) {
        let template_id = DivisionTemplateId::new(self, template_idx);

        let nation_id = NationId::new(self, 0);

        let division = Division {
            commander: None,
            template_id,
            manpower: 0,
            arsenal: Default::default(),
            experience: 0,
            cargo: Default::default(),
            allegiance: nation_id,
        };

        let division_id = DivisionId(self.divisions.len());
        self.divisions.push(division);

        self.divisions_in_training
            .entry(nation_id)
            .or_default()
            .insert(division_id, 0);
    }

    pub fn interop_move_division(&mut self, division_idx: usize, dest_city_idx: u16) {
        let division_id = DivisionId::new(self, division_idx);
        let dest_id = CityId::new(self, dest_city_idx);
        self.move_division(division_id, dest_id);
    }

    pub fn get_divisions_in_training(&mut self) -> JsValue {
        JsValue::from_serde(&self.divisions_in_training).unwrap()
    }

    pub fn get_divisions_undeployed(&mut self) -> JsValue {
        JsValue::from_serde(&self.divisions_undeployed).unwrap()
    }

    pub fn get_all_division_location(&mut self) -> JsValue {
        JsValue::from_serde(&self.division_location).unwrap()
    }

    pub fn interop_deploy_division(&mut self, division_idx: usize, city_idx: u16) {
        let division_id = DivisionId::new(self, division_idx);
        let city_id = CityId::new(self, city_idx);
        self.deploy_division(division_id, city_id);
    }
}

impl Galaxy {
    pub fn get_division_location(&mut self, division_idx: usize) -> CityId {
        let division_id = DivisionId::new(self, division_idx);
        let location = self
            .division_location
            .get(&division_id)
            .expect("division isn't deployed");

        match location {
            &DivisionLocation::City(city_id) => city_id,
            DivisionLocation::Travel { vertex_id, .. } => vertex_id.to_city_id(self),
            DivisionLocation::InTransport => unimplemented!("not handled"),
        }
    }

    pub fn deploy_division(&mut self, division_id: DivisionId, city_id: CityId) {
        let is_removed = self.divisions_undeployed.remove(&division_id);
        assert!(is_removed);

        let city = &self.cities[city_id];
        let city_controller = city.controller;

        let controller = city_controller.expect("cannot deploy in unoccupied locations");

        let division = &self.divisions[division_id];
        let division_nation = division.allegiance;

        assert!(
            controller == division_nation,
            "cannot deploy divisions on foreign territory"
        );

        // insert into the mappings (both directions)
        let vertex_id = city_id.to_vertex_id(&self);
        let no_previous = self.stationed_divisions[vertex_id].insert(division_id);
        assert!(no_previous);

        let previous = self
            .division_location
            .insert(division_id, DivisionLocation::City(city_id));
        assert!(previous.is_none());
    }

    pub fn move_division(&mut self, division_id: DivisionId, dest_id: CityId) {
        const MSG: &'static str= "(TODO?) division movements should follow the transport (i.e. can't move unless the divisions are unloaded to a city";

        let PlanetVertexId {
            planet_id: to_planet,
            vertex_idx: dest_vertex_idx,
        } = dest_id.to_vertex_id(self);
        let division = &self.divisions[division_id];
        let is_civilian = self.division_templates[division.template_id].is_civilian;

        let next_location = match self
            .division_location
            .get(&division_id)
            .expect("cannot move undeployed divisions")
        {
            DivisionLocation::City(at) => {
                assert!(*at != dest_id);

                let PlanetVertexId {
                    planet_id: from_planet,
                    vertex_idx: from_vertex_idx,
                } = at.to_vertex_id(self);

                assert!(from_planet == to_planet);

                self.shortest_path(
                    to_planet,
                    division.allegiance,
                    is_civilian,
                    from_vertex_idx,
                    dest_vertex_idx,
                )
                .and_then(|mut path| {
                    let first = path.pop();
                    assert!(
                        first.expect("path must be non-empty") == from_vertex_idx,
                        "last item (path-in-reverse) must be the from vertex"
                    );

                    let vertex_id = PlanetVertexId::new(self, from_planet, from_vertex_idx);

                    Some(DivisionLocation::Travel {
                        vertex_id,
                        moved: 0.,
                        path,
                    })
                })
            }
            DivisionLocation::Travel { vertex_id, .. } => {
                let PlanetVertexId {
                    vertex_idx: from_vertex_idx,
                    ..
                } = vertex_id;
                self.shortest_path(
                    to_planet,
                    division.allegiance,
                    is_civilian,
                    *from_vertex_idx,
                    dest_vertex_idx,
                )
                .and_then(|mut path| {
                    let first = path.pop();
                    assert!(
                        first.expect("path must be non-empty") == *from_vertex_idx,
                        "last item (path-in-reverse) must be the from vertex"
                    );

                    Some(DivisionLocation::Travel {
                        vertex_id: *vertex_id,
                        moved: 0.,
                        path,
                    })
                })
            }
            DivisionLocation::InTransport => {
                unreachable!(MSG);
            }
        };

        if let Some(data) = next_location {
            self.division_location.insert(division_id, data);
        } else {
            use log;
            log(&format!("cannot move {:?}", division_id));
            unimplemented!("not handled");
        }
    }
}
