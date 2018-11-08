use constants::ANGLE_CHANGE;
use constants::TICKS_PER_SECOND;
use kdtree::KdTree;
use product::Product;
use std::collections::HashMap;
use units::transporter::TransporterState;
use wasm_bindgen::prelude::wasm_bindgen;
use VertexId;
use {
    CityId, DivisionId, FleetAction, FleetId, FleetState, Galaxy, Locatable, LocationIndex,
    PlanetId, PlanetVertexId, StarId, TravelTarget,
};

#[wasm_bindgen]
impl Galaxy {
    pub fn cal_next_state(&mut self) {
        self.timestamp += 1;

        assert!(TICKS_PER_SECOND == 10); // in case I change it in the future

        match self.timestamp % (TICKS_PER_SECOND as u64) {
            1 => {
                self.cal_economy();
            }
            _ => {}
        }

        self.cal_galaxy_movement();
        self.cal_division_training();
        self.update_war_goals();
        self.update_battles();
        self.update_frontlines();
        self.cal_unit_movement();
        self.cal_playable_moves();
    }
}

impl Galaxy {
    pub fn update_battles(&mut self) {
        //

        /*
        for planet in &mut self.planets {
            for battle in &mut planet.battles {
                let attacking = &battle.attacking_divisions;
                let defending = &battle.defending_divisions;
        
                for (i, &attacker_id) in attacking.iter().enumerate() {
                    //
                    let attacker = &self.divisions[attacker_id];
                    // attacker.
                }
            }
        }
        */

    }

    pub fn cal_unit_movement(&mut self) {
        for transporter in &mut self.transporters {
            match transporter.state {
                TransporterState::Move {
                    src_vertex,
                    destination,
                    moved,
                } => {
                    // try to move to destination
                    // when arrived, set state to UnloadGoods
                }
                TransporterState::UnloadGoods { current_vertex } => {
                    // unload everything

                    // set state to Station
                }
                TransporterState::Station {
                    current_vertex,
                    prev_product_kind,
                } => {
                    // find a good neighbour (destination) to trade with, or back to the home city
                    // set state to LoadGoods

                    // pick a neighbour that is most desperately in need of a type of goods
                    // i.e. max(demand of city - in stock qty - in-transport qty)

                    let PlanetVertexId {
                        planet_id,
                        vertex_id,
                    } = transporter.home_vertex;
                    let planet = &self.planets[planet_id];
                    let neighbours = planet.get_neighbours(vertex_id);

                    let mut max_decficit_score: Option<(
                        Product,
                        VertexId,
                        u32,
                    )> = None; // product kind, vertex id, score = min(local trade surplus, neighbour deficit)

                    for neighbour_vertex_id in neighbours {
                        let planet_vertex_id =
                            PlanetVertexId::new(&self.planets, planet_id, *neighbour_vertex_id);
                        let &city_id = &self.vertex_idx_to_city_id[planet_vertex_id];
                        let city = &self.cities[city_id];

                        for (product, deficit_qty) in city.cal_demand_deficits() {
                            let in_stock_qty = city.industry[product].storage_qty;
                            let new_score = in_stock_qty.min(deficit_qty);
                            if let Some((_, _, old_score)) = max_decficit_score {
                                if new_score > old_score {
                                    max_decficit_score =
                                        Some((product, *neighbour_vertex_id, new_score));
                                }
                            } else {
                                max_decficit_score =
                                    Some((product, *neighbour_vertex_id, new_score));
                            }
                        }
                    }
                }
                TransporterState::LoadGoods {
                    current_vertex,
                    destination,
                } => {
                    // load everything needed by destination
                    // register transport qty to the destination
                    // set state to Move
                }
            }
        }
    }

    pub fn update_frontlines(&mut self) {
        //
        for planet in &mut self.planets {
            //
            for frontline in &mut planet.frontlines {
                //
            }
        }
    }

    pub fn update_war_goals(&mut self) {
        for (attacker, goals) in self.war_goals.iter_mut() {
            for (defender, goal) in goals.iter_mut() {
                if goal.creation_time_left > 0 {
                    goal.creation_time_left -= 1;

                    if goal.creation_time_left == 0 {
                        use log;
                        log(&format!(
                            "war justification complete (attacker: {:?}, defender: {:?})",
                            attacker, defender
                        ));
                    }
                } else {
                    //
                    assert!(goal.valid_time_left > 0); // zeroes are removed immediately
                    goal.valid_time_left -= 1;
                }
            }

            goals.retain(|defender, goal| {
                if goal.valid_time_left == 0 {
                    use log;
                    log(&format!(
                        "war goal expired (attacker: {:?}, defender: {:?})",
                        attacker, defender
                    ));
                }
                goal.valid_time_left > 0
            });
        }
        self.war_goals.retain(|_, goals| goals.len() > 0);
    }

    pub fn cal_division_training(&mut self) {
        const FULLY_TRAINED_DAYS: u8 = 100;

        for divisions in self.divisions_in_training.values_mut() {
            for (_, progress) in divisions.iter_mut() {
                *progress += 1;
            }

            divisions.retain(|_, progress| {
                if *progress == FULLY_TRAINED_DAYS {
                    false
                } else {
                    true
                }
            });
        }

        self.divisions_in_training
            .retain(|_, divisions| !divisions.is_empty());
    }

    pub fn cal_economy(&mut self) {
        for city in self.cities.iter_mut() {
            city.update_economy();
        }
    }

    pub fn cal_galaxy_movement(&mut self) {
        self.planets
            .iter_mut()
            .map(|planet| &mut planet.coor)
            .for_each(|coor| {
                let (r, θ) = coor.to_pair();
                let change = ANGLE_CHANGE * 1.0 / r; // futher away, the slower it revolves
                coor.set_angle(θ + change);
            });

        self.stars
            .iter_mut()
            .map(|star| &mut star.coor)
            .chain(self.planets.iter_mut().map(|planet| &mut planet.coor))
            .for_each(|coor| {
                let (r, θ) = coor.to_pair();
                let change = ANGLE_CHANGE * 1.0 / r; // futher away, the slower it revolves
                coor.set_angle(θ + change);
            });

        for fleet in &mut self.fleets {
            fleet.state = match fleet.state {
                FleetState::Docked(..) => unimplemented!(),
                FleetState::Ready(cur_location) => {
                    fleet
                        .actions
                        .pop_front()
                        .map_or(fleet.state, |action| match action {
                            FleetAction::Travel(target) => FleetState::Travel(cur_location, target),
                        })
                }
                FleetState::Travel(cur_location, target) => {
                    match target {
                        TravelTarget::Coor(coor1) => {
                            let direction = coor1 - cur_location;
                            let norm = direction.norm();
                            const SPEED: f32 = 10.5; // TODO should be determined by tech, fuel

                            let next_state = if norm < SPEED {
                                FleetState::Ready(coor1)
                            } else {
                                let unit_vector = direction * (1. / norm);
                                let next_coor = cur_location + unit_vector * SPEED;
                                FleetState::Travel(next_coor, target)
                            };

                            next_state
                        }
                        TravelTarget::City(..) => unimplemented!(),
                    }
                }
                _ => unimplemented!(),
            }
        }

        self.update_locs()
    }

    pub fn is_in_combat(&self, division_id: DivisionId) -> bool {
        false
    }

    /*
    pub fn cal_planet_movement(&mut self) {
        for (division_id, location) in self.division_location.iter_mut() {
            if let DivisionLocation::Travel {
                planet_vertex_id,
                moved,
                path,
            } = location
            {
                let PlanetVertexId {
                    planet_id,
                    vertex_id,
                } = planet_vertex_id;
                let planet = &mut self.planets[*planet_id];
                let next_vertex = path
                    .last()
                    .expect("path shouldn't be empty for DivisionLocation::Travel");
                // let distance
            }
        }
    }
            */

    /** Set ai people's actions that can be performed by the player */
    pub fn cal_playable_moves(&self) {
        /*
        for specialist in &self.specialists {
            match specialist.job {
                Job::None => {
                    // find jobs
                }
                Job::CEO(CorporationId(corp_idx)) => {
                    // decide how many transport drivers should be hired for each colony
                    // up/down size corps, expand/close office
                    // decide quarterly dividends
        
                    // hire/fire managers
        
                    let corp = &self.corporations[corp_idx];
                    let &NationId(nation_idx) = &corp.incorporated_nation;
                    let nation = &self.nations[nation_idx];
                    
                    for &office_idx in &corp.offices {
                        let office = &mut self.offices[office_idx];
                    }
                }
                Job::Governor => {
                    //
                }
                Job::President => {
                    //
                }
                Job::FieldMarshall => {
                    //
                }
                Job::General => {
                    //
                }
                Job::Manager => {
                    // manager is responsible for setting budgets of the office that he's managing
        
                    // The manager calculate the number of transports needed for the office
                    //      - update every k turns, k > 0
                    //      - the values are shared with transport drivers, so drivers use them to estimate goods
                    //      - sum up aggregated demands & supplies for neighbours and their "downstreams"
                    //          - i.e. post-order breadth-first traversal on minimum spanning tree with colony as root
                    //          - result: 4-tuple (real demand, real supply, storage demand, storage supply)
                    //              - real stats: demand & supply of civilian needs and own corps' need
                    //                  - the minimum that transports must bring
                    //              - storage stats: real stats + number of days worth of consumption in reserve
                    //                  - in case of surplus, distribute goods in proprotion to storage stats
                    //       - for d in downstreams
                    //              total suplus = surplus(local) + surplus(downstreams) - surplus(d)
                    //              transports needed for d = total surplus / size of cargo
                    //       - total transports needed = sum of transports needed for all downstreams
                    //          - CEO uses the total to estimate where to allocate transports budgets (i.e. number of drivers to hire)
                    //          - manager performs the hiring
        
                    // TODO set budgets
        
                    // TODO hire/fire workers
        
                    // work is completed on a macro scale, here the person ask for salary
                    // TODO transfer money from corp to manager
                    // TODO try to find greener pastures
                }
                Job::Worker => {
                    // work is completed on a macro scale, here the person ask for salary
                    // TODO transfer money from corp to Worker
                    // TODO try to find greener pastures
                }
                Job::Trader => {
                    // self-employed, perform arbitrage in different markets
        
                    // TODO at a colony, find a colony that need the most goods that the current colony can produce
                }
                Job::TransportDriver => {
                    // TODO transfer money from corp to transport driver
        
                    // employed by a corporation fulltime to tranport goods among offices
                    // TODO transfer money from corp to Worker
        
                    // a transport driver is assigned to a home office
                    // the driver "radiates" goods away from the home office to neighbour offices based on corp's operating map
                    // the driver also attempts to bring back goods from the neighbour
        
                    // TODO find an office that need the most goods, and transports goods there
                    // TODO then bring back goods to home office
                }
            }
        }
        */

        // TODO try to change policies
        // bribe, bring up issues, golf, etc.

        // TODO manage savings: i.e. buy/sell stocks
        // - the money counter represents "safe" savings
        // - the person lose money due to real interest rate (usually negative for "safe" savings)
        //      - acts as money sink
        //      - real interest rate aren't applied to the stock market (I am not an economist)
        //          - as long as companies still exist and are working normally, stock value shouldn't tank (I am not an economist)
        //      - bank loan's real interest rate always positive
        // TODO stock prices is probably just random walk on a fixed band; risks:
        //      - competition
        //      - market crashes (another random walk probably), which reduces civilian demands
        //      - war: war economy increases raw materials demands for ships and weapon (due to nation drafting)
        //          - but drastically lower luxury consumption
        //      - pirates
        //      - change in human resource (CEO, managers, workers)
        //          - skills greatly affect efficiency
        //          - firing and retirement lend to needs for hiring freshmen; change in skills
        //              - severance pay: 10% of current income per years worked in the company
        //              - note: the length that a person work for a company increases his/her company knowledge (a stat)
        //      - change in government policies
        //          - tax, tariffs

    }

    pub fn update_locs(&mut self) {
        // insert order is important

        // recreate index

        let size_hint =
            self.stars.len() + self.planets.len() + self.cities.len() + self.fleets.len();

        self.loc_idx = LocationIndex({
            let mut ret = KdTree::new_with_capacity(2, size_hint.max(1000));

            for (i, star) in self.stars.iter().enumerate() {
                let (x, y) = star.coor.to_cartesian().to_pair();
                let id = Locatable::Star(StarId::wrap_usize(i));
                ret.add([x.into(), y.into()], id).unwrap();
            }

            for (i, planet) in self.planets.iter().enumerate() {
                let (x, y) = planet.get_coor(&self).to_pair();
                let id = Locatable::Planet(PlanetId::wrap_usize(i));
                ret.add([x.into(), y.into()], id).unwrap();
            }

            for (i, _) in self.cities.iter().enumerate() {
                let id = CityId::from_usize(&self, i);
                let (x, y) = self.get_city_coor(id);
                ret.add([x.into(), y.into()], Locatable::City(id)).unwrap();
            }

            for (i, fleet) in self.fleets.iter().enumerate() {
                let coor = match fleet.state {
                    FleetState::Ready(coor) => Some(coor.to_pair()),
                    FleetState::Travel(coor, _) => Some(coor.to_pair()),
                    _ => None,
                };

                if let Some((x, y)) = coor {
                    let id = FleetId::from_usize(&self, i);
                    ret.add([x.into(), y.into()], Locatable::Fleet(id)).unwrap();
                }
            }

            ret
        });
    }
}
