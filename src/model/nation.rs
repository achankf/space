use std::collections::{HashMap, HashSet, VecDeque};
use std::iter::FromIterator;
use std::ops::{Index, IndexMut};
use wasm_bindgen::prelude::{wasm_bindgen, JsValue};
use AccessRight;
use CityId;
use Foreign;
use Galaxy;
use Nation;
use NationId;
use PlanetVertexId;
use War;
use WarGoal;

const CIV_ACCESS_THRESHOLD: u32 = 100;
const BASE_WAR_GOAL_CREATION_TIME: u32 = 100;
const WAR_GOAL_VALID_TIME: u32 = 100;

impl Galaxy {
    pub fn cal_access_right_acceptance(
        &mut self,
        my_nation_id: NationId,
        target_nation_id: NationId,
        right: AccessRight,
    ) -> u32 {
        // TODO take relation & strategic values into account

        // nation.foreign.get_mut(&target_nation_id).unwrap()
        100
    }

    pub fn can_nation_enter(
        &self,
        nation_id: NationId,
        vertex_id: PlanetVertexId,
        is_civilian: bool,
    ) -> bool {
        let city_id = vertex_id.to_city_id(self);
        let city = &self.cities[city_id];

        // default is uncolonized
        city.controller.map_or(true, |controller| {
            if controller == nation_id {
                true
            } else {
                let rights = self.nations[nation_id].foreign[controller].access;
                if is_civilian {
                    rights == AccessRight::Civilian || rights == AccessRight::Military
                } else {
                    rights == AccessRight::Military
                }
            }
        })
    }

    pub fn is_at_war_with(&self, my_nation_id: NationId, target_nation_id: NationId) -> bool {
        self.wars.iter().any(|war| {
            (war.aggressors.contains_key(&my_nation_id)
                && war.defenders.contains_key(&target_nation_id))
                || (war.aggressors.contains_key(&target_nation_id)
                    && war.defenders.contains_key(&my_nation_id))
        })
    }
}

#[wasm_bindgen]
impl Galaxy {
    pub fn justify_war(&mut self, my_nation_idx: u16, target_nation_idx: u16) {
        let my_nation_id = NationId::new(self, my_nation_idx);
        let target_nation_id = NationId::new(self, target_nation_idx);
        let entry = self.war_goals.entry(my_nation_id);

        let prev = entry.or_default().insert(
            target_nation_id,
            WarGoal {
                creation_time_left: BASE_WAR_GOAL_CREATION_TIME,
                valid_time_left: WAR_GOAL_VALID_TIME,
            },
        );
        assert!(prev.is_none());
    }

    pub fn has_war_goal(&self, my_nation_idx: u16, target_nation_idx: u16) -> bool {
        let my_nation_id = NationId::new(self, my_nation_idx);
        let target_nation_id = NationId::new(self, target_nation_idx);

        self.war_goals
            .get(&my_nation_id)
            .map_or(false, |goals| goals.get(&target_nation_id).is_some())
    }

    pub fn declare_war(
        &mut self,
        attacker: u16,
        defender: u16,
        other_aggressors: Vec<u16>,
        other_defenders: Vec<u16>,
    ) {
        let attacker_id = NationId::new(self, attacker);
        let defender_id = NationId::new(self, defender);

        // spend the war goal
        self.war_goals
            .get_mut(&attacker_id)
            .and_then(|goals| goals.remove(&defender_id))
            .expect("attacker must have a war goal");

        let mut aggressors: HashMap<_, _> = other_aggressors
            .into_iter()
            .map(|nation_idx| {
                let nation_id = NationId::new(self, nation_idx);
                (nation_id, 0)
            })
            .collect();

        let prev = aggressors.insert(attacker_id, 0);
        assert!(prev.is_none());

        let mut defenders: HashMap<_, _> = other_defenders
            .into_iter()
            .map(|nation_idx| {
                let nation_id = NationId::new(self, nation_idx);
                (nation_id, 0)
            })
            .collect();

        let prev = defenders.insert(defender_id, 0);
        assert!(prev.is_none());

        assert!(
            aggressors.keys().all(|id| !defenders.contains_key(id)),
            "country cannot be both aggressor and defender"
        );

        self.wars.push(War {
            aggressors,
            defenders,
        });
    }

    pub fn interop_is_at_war_with(&mut self, my_nation_idx: u16, target_nation_idx: u16) -> bool {
        let my_nation_id = NationId::new(self, my_nation_idx);
        let target_nation_id = NationId::new(self, target_nation_idx);
        self.is_at_war_with(my_nation_id, target_nation_id)
    }

    pub fn change_access_right(
        &mut self,
        my_nation_idx: u16,
        target_nation_idx: u16,
        right: AccessRight,
    ) {
        let my_nation_id = NationId::new(self, my_nation_idx);
        let target_nation_id = NationId::new(self, target_nation_idx);
        assert!(
            self.cal_access_right_acceptance(my_nation_id, target_nation_id, right)
                >= Self::access_threshold(right)
        );
        let nation = &mut self.nations[my_nation_id];
        nation.foreign[target_nation_id].access = right;
    }

    pub fn access_threshold(right: AccessRight) -> u32 {
        CIV_ACCESS_THRESHOLD
    }
}
