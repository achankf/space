use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use CityId;
use CombatStyle;
use Division;
use DivisionId;
use DivisionLocation;
use DivisionStats;
use DivisionTemplate;
use DivisionTemplateId;
use Galaxy;
use NationId;
use PlanetVertexId;
use WarId;

#[wasm_bindgen]
impl Galaxy {
    pub fn add_division_template(
        &mut self,
        num_infantry_squads: usize,
        num_artillery_squads: usize,
        num_tank_squads: usize,
        style: CombatStyle,
        is_civilian: bool,
    ) {
        let template = DivisionTemplate {
            style,
            is_civilian,
            num_infantry_squads,
            num_artillery_squads,
            num_tank_squads,
            max_speed: 1,   // TODO
            max_morale: 10, // TODO
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
            soldiers: Default::default(),
            morale: 0,
            experience: 0,
            storage: Default::default(),
            allegiance: nation_id,
        };

        let division_id = DivisionId(self.divisions.len());
        self.divisions.push(division);

        self.divisions_in_training
            .entry(nation_id)
            .or_default()
            .insert(division_id, 0);
    }

    pub fn interop_move_division(&mut self, division_idx: usize, dest_city_idx: usize) {
        let division_id = DivisionId::new(self, division_idx);
        let dest_id = CityId::from_usize(self, dest_city_idx);
        self.move_division(division_id, dest_id);
    }

    pub fn get_divisions_in_training(&mut self) -> JsValue {
        JsValue::from_serde(&self.divisions_in_training).unwrap()
    }

    pub fn get_all_division_location(&mut self) -> JsValue {
        JsValue::from_serde(&self.division_location).unwrap()
    }

    pub fn interop_deploy_division(&mut self, division_idx: usize, city_idx: usize) {
        let division_id = DivisionId::new(self, division_idx);
        let city_id = CityId::from_usize(self, city_idx);
        self.deploy_division(division_id, city_id);
    }
}

impl Galaxy {
    pub fn cal_division_stats(&self, division_id: DivisionId) -> DivisionStats {
        let location = self
            .division_location
            .get(&division_id)
            .expect("cannot calculate running stats for undeployed divisions");

        let division = &self.divisions[division_id];
        let pop = division.soldiers.values().sum();

        // TODO adjust parameters with equipment

        let base_attack = pop;
        let base_defense = pop / 2;

        DivisionStats {
            attack: base_attack,
            defense: base_defense,
            speed: 1,
        }
    }

    pub fn cal_combat(&mut self) {
        // steps:
        // - calculate how many combats divisions are participating; used for calculating combat penalties
        // - calculute sum of all attacker & defender values
        // - calculate death and equipment loss
        // - resolve combat status (Division Location set to Travel or Retreat)

        let num_participated_combats = {
            let mut ret = HashMap::<DivisionId, u8>::default();
            let combats: HashMap<WarId, Vec<Combat>> = Default::default();

            for (&planet_id, combats) in &self.battles {
                const MSG_PLANET_NO_UNIT: &'static str =
                    "invalid bookkeeping: planet has zero unit; no combat can occur";
                let planet_units = self
                    .vertex_to_divisions
                    .get(&planet_id)
                    .expect(MSG_PLANET_NO_UNIT);

                for (defend_vertex, all_attackers) in combats {
                    for (_, attacker_ids) in all_attackers {
                        //
                        for &attacker_id in attacker_ids {
                            *ret.entry(attacker_id).or_default() += 1;
                        }
                    }

                    // memoize by nation
                    let mut all_num_attacking_sides = HashMap::<NationId, u8>::default();

                    const MSG_NO_DEFENDER: &'static str = "invalid bookkeeping: each entry in Galaxy.combats must have at least 1 defender";
                    let defender_candidates =
                        planet_units.get(&defend_vertex).expect(MSG_NO_DEFENDER);

                    for &candidate_id in defender_candidates {
                        //
                        let candidate = &self.divisions[candidate_id];

                        /*
                        let num_attacking_sides = *all_num_attacking_sides
                            .entry(candidate.allegiance)
                            .or_insert_with(|| {
                                let count = 0u8;
                                for (_, attacker_ids) in all_attackers {
                                    //
                        
                                }
                        
                                let count: HashSet<_> = all_attackers
                                    .iter()
                                    .filter(|(_, attacker_ids)| {
                                        attacker_ids.iter().any(|&attacker_id| {
                                            let attacker = &self.divisions[attacker_id];
                                            self.is_at_war_with(
                                                attacker.allegiance,
                                                candidate.allegiance,
                                            )
                                        })
                                    })
                                    .collect();
                                use std::u8::MAX;
                                //  assert!(count < MAX as usize);
                                0
                            });
                        
                        if num_attacking_sides > 0 {
                            *ret.entry(candidate_id).or_default() += num_attacking_sides;
                        }
                        */
                    }
                }
            }
            ret
        };

        struct Combat {
            attackers: HashSet<DivisionId>,
            defenders: HashSet<DivisionId>,
        }
        let combats: HashMap<WarId, Vec<Combat>> = Default::default();
    }

    pub fn get_division_location(&mut self, division_idx: usize) -> CityId {
        let division_id = DivisionId::new(self, division_idx);
        let location = self
            .division_location
            .get(&division_id)
            .expect("division isn't deployed");

        match location {
            &DivisionLocation::City(city_id) => city_id,
            DivisionLocation::Travel {
                planet_vertex_id, ..
            } => self.vertex_idx_to_city_id[*planet_vertex_id],
            DivisionLocation::Retreat {
                planet_vertex_id, ..
            } => self.vertex_idx_to_city_id[*planet_vertex_id],
            DivisionLocation::InTransport => unimplemented!("not handled"),
        }
    }

    pub fn deploy_division(&mut self, division_id: DivisionId, city_id: CityId) {
        let city = &self.cities[city_id];
        let city_controller = city.controller;

        let controller = city_controller.expect("cannot deploy in unoccupied locations");

        let division = &self.divisions[division_id];
        let division_nation = division.allegiance;

        assert!(!self
            .divisions_in_training
            .get(&division_nation)
            .map_or(false, |divisions| !divisions.contains_key(&division_id)));

        assert!(
            controller == division_nation,
            "cannot deploy divisions on foreign territory"
        );

        // insert into the mappings (both directions)
        let vertex_id = self.to_vertex_id(city_id);
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
            vertex_id: dest_vertex_id,
        } = self.to_vertex_id(dest_id);
        let division = &self.divisions[division_id];
        let is_civilian = self.division_templates[division.template_id].is_civilian;

        let next_location = match self
            .division_location
            .get(&division_id)
            .expect("cannot move undeployed divisions")
        {
            &DivisionLocation::City(at) => {
                assert!(at != dest_id);

                let PlanetVertexId {
                    planet_id: from_planet,
                    vertex_id: from_vertex_id,
                } = self.to_vertex_id(at);

                assert!(from_planet == to_planet);

                self.shortest_path(
                    to_planet,
                    division.allegiance,
                    is_civilian,
                    from_vertex_id,
                    dest_vertex_id,
                )
                .and_then(|mut path| {
                    let first = path.pop();
                    assert!(
                        first.expect("path must be non-empty") == from_vertex_id,
                        "last item (path-in-reverse) must be the from vertex"
                    );

                    let planet_vertex_id =
                        PlanetVertexId::new(&self.planets, from_planet, from_vertex_id);

                    Some(DivisionLocation::Travel {
                        planet_vertex_id,
                        moved: 0.,
                        path,
                    })
                })
            }
            DivisionLocation::Travel {
                planet_vertex_id, ..
            } => {
                let PlanetVertexId {
                    vertex_id: from_vertex_id,
                    ..
                } = planet_vertex_id;
                self.shortest_path(
                    to_planet,
                    division.allegiance,
                    is_civilian,
                    *from_vertex_id,
                    dest_vertex_id,
                )
                .and_then(|mut path| {
                    let first = path.pop();
                    assert!(
                        first.expect("path must be non-empty") == *from_vertex_id,
                        "last item (path-in-reverse) must be the from vertex"
                    );

                    Some(DivisionLocation::Travel {
                        planet_vertex_id: *planet_vertex_id,
                        moved: 0.,
                        path,
                    })
                })
            }
            &DivisionLocation::Retreat {
                planet_vertex_id,
                moved,
                dest,
            } => Some(DivisionLocation::Retreat {
                // TODO
                planet_vertex_id,
                moved,
                dest,
            }),
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
