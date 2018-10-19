use cal_orbit_coor;
use cal_star_orbit_coor;
use kdtree::KdTree;
use wasm_bindgen::prelude::wasm_bindgen;
use {ANGLE_CHANGE, DivisionId, DivisionLocation, Galaxy, Locatable, LocationIndex, PlanetId, PlanetVertexId, Product, StarId, TWO_PI};

#[wasm_bindgen]
impl Galaxy {
    pub fn cal_next_state(self) -> Self {
        self.cal_world()
            .cal_division_training()
            .update_war_goals()
            .update_battles()
            .update_frontlines()
            .cal_action_queue()
            .cal_galaxy_movement()
            .cal_playable_moves()
            .cal_micro_activities()
            .cal_economy()
    }
}

impl Galaxy {
    pub fn update_battles(mut self) -> Self {
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

        self
    }

    pub fn update_frontlines(mut self) -> Self {
        //
        for planet in &mut self.planets {
            //
            for frontline in &mut planet.frontlines {
                //
            }
        }
        self
    }

    pub fn update_war_goals(mut self) -> Self {
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

        self
    }

    pub fn cal_division_training(mut self) -> Self {
        const FULLY_TRAINED_DAYS: u8 = 100;

        for divisions in self.divisions_in_training.values_mut() {
            for (id, progress) in divisions.iter_mut() {
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

        self
    }

    pub fn cal_world(mut self) -> Self {
        /*
        outline in general, but executed on a per-person basis
        
        for every nation
            handle politics
                - members bring up issues and vote for them; have cooldown
                - change leadership
            handle tariffs and tax
            handle diplomacy
                - calculate influence map of techs, military powers, industry
                - find allies that can pinch smaller guys
                - blob up until fighting small guys are profitable
                - start a galactic-scale war for domination (TODO? maybe add alternative victories like science)
                - try to reinforce borders; prioritize
        for every colony
            handle growth
            handle warfare (choose attack or defend against other colonies)
            rearrange forces (keep min force on neutral borders, focus the rest on 1 theatre)
            update tariffs and tax (with cooldown)
            decide funding among military (public), subsidies (private), civilian (welfare; good for both)
        
        overall, this should be
        
        for each person
            do his/her job
        */

        /*
        for nation in &self.nations {
        
        }
        */

        // start with a person
        // look for opportunities
        // borrow money and start a business

        /*
        
        if company doesn't have any assets (factories, stores) then
            if competition is low (based on demand and supply)
                build a factory/store in a sector that the CEO is good at
            else
                pick an industry that has the least competition
        
        post jobs if available
        
        if company is making profits and has enough money to expand
            estimate which industry has the best profit margins and expand in that direction
            
        
                */

        /*
        let industry = self.cal_colony_industry();
        let population = self.cal_population();
        
        {
            let industry_employed = industry * 1000000;
            let remain_population = if population as u32 >= industry_employed {
                population as u32 - industry_employed
            } else {
                0
            };
        
            let planet = &mut self.planets[0];
            let tiles = &mut planet.tiles;
            let extracted_qtys = self.colonies[0]
                .controlled_tiles
                .iter()
                .enumerate()
                .filter(|&(_, &is_controlled)| is_controlled)
                .fold(
                    EnumMap::<Product, u32>::default(),
                    |mut acc, (tile_idx, _)| {
                        let tile = &mut tiles.data[tile_idx];
                        let extractors = remain_population as f64 / 1000000f64;
                        let extraction_qty = 1.0;
                        let total_extractor_qty = extractors * extraction_qty;
        
                        for (product, base_rate) in tile.base_resource_rates {
                            // here we guarantee at least 1 unit of raw resource production to bootstrap the game
                            let total_qty = base_rate as f64 * total_extractor_qty.max(1.0);
                            acc[product] += total_qty.ceil() as u32;
                        }
                        acc
                    },
                );
        
            let colony = &mut self.colonies[0];
            for (product, data) in colony.products.iter_mut() {
                data.qty += extracted_qtys[product];
            }
        
            let mut total_consumption = EnumMap::<Product, u32>::default();
            let mut total_production = EnumMap::<Product, u32>::default();
            let base_demands = Product::base_demands();
            for (product, data) in &colony.products {
                let production_capacity = data.production_capacity;
        
                if production_capacity == 0 {
                    continue;
                }
        
                let demands = base_demands[product];
        
                let (actual_produce_qty, actual_consumption) = match demands
                    .iter()
                    .filter(|&(_, &qty)| qty > 0)
                    .map(|(product, demand_qty)| {
                        let stock_qty = colony.products[product].qty - total_consumption[product];
                        stock_qty / demand_qty
                    })
                    .min()
                {
                    Some(potential_product_qty) => {
                        let actual_produce_qty = potential_product_qty.min(production_capacity);
                        let actual_consumption = demands.iter().fold(
                            EnumMap::<Product, u32>::default(),
                            |mut acc, (product, unit_consume_qty)| {
                                acc[product] += unit_consume_qty * actual_produce_qty;
                                acc
                            },
                        );
                        (actual_produce_qty, actual_consumption)
                    }
                    None => (production_capacity, EnumMap::<Product, u32>::default()),
                };
        
                for (product, consume_qty) in actual_consumption {
                    total_consumption[product] += consume_qty;
                }
                total_production[product] += actual_produce_qty;
            }
            for (product, consume_qty) in total_consumption {
                assert!(
                    colony.products[product].qty >= consume_qty,
                    "over-consume input materials"
                );
                let product_qty = total_production[product];
                colony.products[product].qty += product_qty - consume_qty; // note: modular arithmetic when right-hand side is "negative", but overall qty should not wrap over to u32::MAX
            }
        
            let civilian_consumption = population as u32;
            let food_consumption = colony.products[Product::Food].qty.min(civilian_consumption);
            colony.products[Product::Food].qty -= food_consumption;
        
            let total_money = food_consumption as f32;
            let private_income = total_money * (1.0 - colony.income_tax_rate);
            colony.private_money += private_income as i32;
            colony.public_money += (total_money - private_income) as i32;
        
            let growth_rate = 0.02; // 2%
            let days_in_year = 400.0;
            let growth_daily = growth_rate / days_in_year;
            for tile in &mut tiles.data {
                tile.population = tile.population * (1.0 + growth_daily);
            }
        }
        */

        /*
                for planet in self.planets.iter_mut() {
                    for colony in planet.colonies.iter_mut() {
                        // handle population growth
                        {
                            // TODO
        
                            let max_population = planet.territory as f32;
        
                            assert!(colony.population > 0.0);
                            let growth = colony.population + 1.0; // TODO take development into account
                            colony.population = growth / (max_population + growth) * max_population;
                        }
        
                        // handle specialist growth
                        {
                            let specialist_growth_rate = colony.specialist_growth_rate();
                            let specialist_points = colony.specialist_points;
                            let new_specialist_points = {
                                let next = specialist_points + specialist_growth_rate;
                                if next < 0.0 {
                                    0.0
                                } else if next > 1.0 {
                                    1.0
                                } else {
                                    next
                                }
                            };
        
                            // enough points, add a new specialist
                            if new_specialist_points == 1.0 {
                                colony.specialist_points = 0.0;
        
                                let specialist_idx = self.specialists.len();
                                self.specialists.push(Default::default());
                                colony.specialist_homes.insert(specialist_idx);
                            } else {
                                // otherwise just accumulate the points
                                colony.specialist_points = new_specialist_points;
                            }
                        }
                    }
                }
        */
        self
    }

    /** Perform other actions that are performed automatically by the game,
    like corps making actual investements or government constructions */
    pub fn cal_action_queue(self) -> Self {
        self
    }

    pub fn cal_economy(self) -> Self {
        self.cal_office_buy()
            .cal_industry_production()
            .cal_industry_sell()
            .cal_civilian_consumption()
    }

    pub fn cal_galaxy_movement(mut self) -> Self {
        self.angles = self
            .locs
            .keys()
            .into_iter()
            .map(|id| {
                let new_angle = {
                    let &old_angle = self
                        .angles
                        .get(&id)
                        .expect("all planets must have a angle relative to stars");
                    self.cal_next_angle(id, old_angle)
                };

                (*id, new_angle)
            })
            .collect();

        self.update_locs()
    }

    pub fn is_in_combat(&self, division_id: DivisionId) -> bool {
        false
    }

    pub fn cal_planet_movement(mut self) -> Self {
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

        self
    }

    /** Set ai people's actions that can be performed by the player */
    pub fn cal_playable_moves(self) -> Self {
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

        self
    }

    pub fn update_locs(mut self) -> Self {
        self.locs.clear();

        // insert order is important

        for (i, star) in self.stars.iter().enumerate() {
            let id = Locatable::Star(StarId(i as u16));
            let &angle = self
                .angles
                .get(&id)
                .expect("all stars must have a angle relative to the origin");
            let new_coor = cal_star_orbit_coor(star.orbit_radius, angle);
            self.locs.insert(id, new_coor);
        }

        for (i, planet) in self.planets.iter().enumerate() {
            let id = Locatable::Planet(PlanetId(i as u16));
            let &angle = self
                .angles
                .get(&id)
                .expect("all planets must have a angle relative to stars");
            let new_coor = cal_orbit_coor(&self, &planet.orbit, angle);
            self.locs.insert(id, new_coor);
        }

        // recreate index

        let size_hint = {
            let LocationIndex(old) = self.loc_idx;
            old.size()
        };

        let mut loc_idx = KdTree::new_with_capacity(2, size_hint.max(1000));

        for (&id, &(x, y)) in &self.locs {
            loc_idx.add([x as f64, y as f64], id).unwrap();
        }

        self.loc_idx = LocationIndex(loc_idx);

        self
    }

    pub fn cal_micro_activities(self) -> Self {
        self
    }
}

impl Galaxy {
    fn cal_civilian_consumption(mut self) -> Self {
        // simply take goods away from the market storage, with a catch:
        // the zone that has the highest development take first

        /*
        for planet in self.planets.iter_mut() {
            for colony in planet.colonies.iter_mut() {
                let demands = colony.cal_civilian_demands();
                let mut consumed: ProductMapU = Default::default();
        
                // buy (simply take away) goods from the market
                for (demand_product, demand_qty) in demands {
                    let products = &mut colony.products[demand_product];
                    let qty_in_stock = products.qty;
                    let qty_consumed = qty_in_stock.min(demand_qty);
                    products.qty -= qty_consumed;
                    consumed[demand_product] += qty_consumed;
                }
        
                // TODO update consumption stats for the colony
            }
        }
        */

        self
    }

    // TODO use relay storage when running out of storage
    fn cal_industry_production(mut self) -> Self {
        let all_base_demands = Product::base_demands();

        /*
                for planet in self.planets.iter_mut() {
                    for colony in planet.colonies.iter_mut() {
                        // produce products for all corporations based on their production distribution
                        for &office_idx in &colony.offices {
                            let office = &mut self.offices[office_idx];
        
                            let storage = &mut office.storage;
                            for (produce_product, ref params) in office
                                .products
                                .iter()
                                .filter(|&(_, params)| params.production_capacity > 0)
                            {
                                let production_capacity = params.production_capacity;
                                let base_demands = all_base_demands[produce_product];
        
                                let actual_qty = {
                                    // the number that can be produced given enough industrial capacity
                                    let potential_qty = base_demands
                                        .iter()
                                        .map(|(input_product, &unit_factor)| {
                                            if unit_factor > 0 {
                                                storage[input_product].qty / unit_factor
                                            } else {
                                                use std::u32::MAX;
                                                MAX // infinity, no need to consume resources
                                            }
                                        }).min();
        
                                    match potential_qty {
                                        Some(potential_qty) => potential_qty.min(production_capacity),
                                        None => production_capacity,
                                    }
                                };
        
                                // consume input products, then produce output products
                                for (input_product, unit_factor) in base_demands {
                                    let stored_qty = storage[input_product].qty;
                                    let consume_qty = actual_qty * unit_factor;
                                    assert!(stored_qty >= consume_qty);
                                    storage[input_product].qty = stored_qty - consume_qty;
                                }
        
                                storage[produce_product].qty += actual_qty;
                            }
                        }
                    }
                }
        */

        self
    }

    fn cal_office_buy(mut self) -> Self {
        /*
        for planet in self.planets.iter_mut() {
            for colony in planet.colonies.iter_mut() {
                let market = colony.market_storage;
        
                // TODO rank industry
                for &office_idx in &colony.offices {
                    let office = &mut self.offices[office_idx];
                    let demands = office.cal_total_demands();
                    let storage = &mut office.storage;
        
                    for (product, demand_qty) in demands {
                        let bought = {
                            let market_qty = market[product];
                            market_qty.min(demand_qty)
                        };
        
                        storage[product].qty += bought;
        
                        // TODO transfer money to the market
                    }
                }
            }
        }
        */

        self
    }

    fn cal_industry_sell(mut self) -> Self {
        /*
        for planet in self.planets.iter_mut() {
            for colony in planet.colonies.iter_mut() {
                let mut market = colony.market_storage;
                let potential_demands = colony.cal_civilian_demands();
        
                for &office_idx in &colony.offices {
                    let office = &mut self.offices[office_idx];
        
                    for (product, storage_params) in office
                        .storage
                        .iter_mut()
                        .filter(|(_, params)| params.qty > 0)
                    {
                        let potential = potential_demands[product];
                        let in_stock = market[product];
                        let is_market_full = potential <= in_stock;
                        let qty = storage_params.qty;
        
                        let (sold, storage_decrease) = match storage_params.strategy {
                            TradeStrategy::Hold => (0, 0),     // no change
                            TradeStrategy::Dump => (qty, qty), // all goods in storage goes to the market
                            TradeStrategy::Free => {
                                if is_market_full {
                                    (0, 0)
                                } else {
                                    let sold = {
                                        let needs = potential - in_stock;
                                        needs.min(qty)
                                    };
                                    (sold, sold)
                                }
                            }
                            TradeStrategy::Destroy => {
                                if is_market_full {
                                    (0, qty) // destroy remaining goods in storage, nothing sold
                                } else {
                                    let sold = {
                                        let needs = potential - in_stock;
                                        needs.min(qty)
                                    };
                                    (sold, qty) // all goods must be cleared regardless how much were sold
                                }
                            }
                        };
        
                        assert!(qty >= storage_decrease);
                        assert!(market[product] >= sold);
                        assert!(storage_decrease >= sold); // no magic
        
                        storage_params.qty -= storage_decrease;
                        market[product] += sold;
        
                        // TODO update corp's money balance
                    }
                }
            }
        }
        */

        self
    }

    fn cal_next_angle(&self, id: &Locatable, old_angle: f32) -> f32 {
        let orbit_radius = match *id {
            Locatable::Planet(PlanetId(idx)) => {
                let planet = &self.planets[idx as usize];
                planet.orbit.orbit_radius
            }
            Locatable::Star(StarId(idx)) => {
                let star = &self.stars[idx as usize];
                star.orbit_radius
            }
            _ => return old_angle,
        };

        let change = ANGLE_CHANGE * 1.0 / orbit_radius; // orbit_radius.powf(2.0); // futher away, the slower it revolves

        (old_angle + change) % TWO_PI
    }
}
