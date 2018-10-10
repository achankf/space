#![feature(self_struct_ctor)]

extern crate strsim;
extern crate wasm_bindgen;
extern crate wbg_rand;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate enum_map;
extern crate delaunator;
extern crate nalgebra;
extern crate ordered_float;
extern crate rand;

pub mod cal_state;
mod city;
pub mod division;
pub mod galaxy;
pub mod id;
pub mod interop;
mod kruskal;
pub mod nation;
pub mod planet;
mod product;
mod search;
mod unionfind;
mod util;

use enum_map::EnumMap;
use nalgebra::geometry::Point2;
use std::collections::{HashMap, HashSet, VecDeque};
use std::f32::consts::PI;
use std::hash::Hash;
use util::{
    cal_orbit_coor, cal_star_orbit_coor, distance_point_segment, loc_hash, loc_hash_scaled,
};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Clone)]
pub struct CityGraph {
    pub num_structures: usize,
    points: Vec<f32>,
    dims: Vec<u8>,
    roads: Vec<u32>,
}

#[wasm_bindgen]
impl CityGraph {
    pub fn get_points(&self) -> *const f32 {
        self.points.as_ptr()
    }

    pub fn get_dims(&self) -> *const u8 {
        self.dims.as_ptr()
    }

    pub fn get_roads(&self) -> *const u32 {
        self.roads.as_ptr()
    }
}

pub struct BasicMinimumSpanningTree<V> {
    mappings: HashMap<V, usize>,
    structure: Vec<Vec<usize>>,
}

impl<T> BasicMinimumSpanningTree<T>
where
    T: Eq + Hash,
{
    pub fn len(&self) -> usize {
        self.structure.len()
    }
}

#[derive(Default)]
pub struct MinimumSpanningTree<T>
where
    T: Eq + Hash,
{
    mappings: HashMap<T, usize>,
    structure: Vec<Vec<usize>>,
    all_parents: Vec<Vec<usize>>,
}

impl<T> MinimumSpanningTree<T>
where
    T: Eq + Hash,
{
    pub fn len(&self) -> usize {
        self.structure.len()
    }
}

pub type TreeParents<T> = HashMap<T, T>; // one parents for one designated root node
pub type AllTreeParents<T> = HashMap<T, TreeParents<T>>;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(msg: &str);
}

const TWO_PI: f32 = 2.0 * PI;
const LOC_HASH_FACTOR: f32 = 10.0; // should be larger than all entity represented on the map
const LOC_DIM_MAX: i32 = 2 << 15;
const ANGLE_CHANGE: f32 = 0.001;
const TICKS_PER_SECOND: u32 = 10;

const CITY_DIST: f32 = 50.;
const CITY_DIST_OFFSET: f32 = CITY_DIST / 2.;
const EDGE_MAX_CITY_DIST: f32 = 2.5 * CITY_DIST;

const CITY_RADIUS_LIMIT: f32 = CITY_DIST / 5.;

#[wasm_bindgen]
pub fn get_planet_vertex_dist() -> f32 {
    CITY_DIST
}

#[wasm_bindgen]
pub fn get_ticks_per_second() -> u32 {
    TICKS_PER_SECOND
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct CorporationId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct SpecialistId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct PlanetId(u16);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct StarId(u16);

#[wasm_bindgen]
#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct NationId(u16);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize, PartialOrd, Ord)]
pub struct DivisionId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct DivisionTemplateId(usize);

#[derive(Debug, PartialOrd, Ord, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct CityId(u16);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct WarId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct PlanetVertexId {
    planet_id: PlanetId,
    vertex_idx: u8,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct ColonyId {
    planet_idx: u16,
    colony_idx: u16,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct SpacecraftId {
    kind: SpacecraftKind,
    idx: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Id {
    Corporation(CorporationId),
    Specialist(SpecialistId),
    Planet(PlanetId),
    Star(StarId),
    Nation(NationId),
    Colony(ColonyId),
    Spacecraft(SpacecraftId),
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub enum Locatable {
    Planet(PlanetId),
    Star(StarId),
}

pub struct Orbit {
    orbit_radius: f32,
    center: Locatable,
    radius: f32,
}

pub struct City {
    population: usize,

    // factors that affect development
    consumption_lvl: f32,    // civilian consumption
    education_lvl: f32,      // education level
    health_lvl: f32,         // health level
    happy_lvl: f32,          // happiness level
    safety_lvl: f32,         // safety level
    infrastructure_lvl: f32, // infrastructure level
    energy_lvl: f32,         // energy utilization
    telecom_lvl: f32,

    influence: HashMap<NationId, f32>,

    market: EnumMap<Product, usize>,

    // base_industry: usize,
    // base_commerce: usize,
    // industry: usize, // produce goods for civilian consumption & other use, goods based on suburb kind
    // commerce: usize, // determine usable budgets for civilian consumption
    industry: [(Product, usize); 1], // product is fixed upon world generation
    custom_industry: [Option<(Product, usize)>; 1],

    owner: Option<NationId>,
    controller: Option<NationId>,
}

#[derive(Copy, Clone, PartialOrd, Ord, PartialEq, Eq, Hash)]
pub struct SortedEdge<T>(T, T)
where
    T: Copy + Clone + PartialOrd + Ord + PartialEq + Eq + Hash;

#[derive(Hash, Eq, PartialEq)]
enum Armor {
    // armor
    ArmoredMount {
        tech: u16,
        armor: u8,
        durability: u8,
        breakthrough: u8,
        consumption: u8,
        mobility: u8,
    },
    Tank {
        tech: u16,
        armor: u8,
        durability: u8,
        breakthrough: u8,
        consumption: u8,
        mobility: u8,
    },
    HoverTank {
        tech: u16,
        armor: u8,
        durability: u8,
        breakthrough: u8,
        consumption: u8,
        mobility: u8,
    },
}

#[derive(Hash, Eq, PartialEq)]
enum Logistics {
    // trade & supply & maneuver
    Mount {
        tech: u16,
        armor: u8,
        durability: u8,
        capacity: u8,
        consumption: u8,
        mobility: u8,
    },
    Truck {
        tech: u16,
        armor: u8,
        durability: u8,
        capacity: u8,
        consumption: u8,
        mobility: u8,
    },
    HoverTruck {
        tech: u16,
        armor: u8,
        durability: u8,
        capacity: u8,
        consumption: u8,
        mobility: u8,
    },
}

#[derive(Hash, Eq, PartialEq)]
enum Artillery {
    // bomb
    Catapult {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // pre-industrial
    Artillery {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        explosive: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // industrial
    ParticleCannon {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        power: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // galactic
}

#[derive(Hash, Eq, PartialEq)]
enum MeleeWeapon {
    // shock
    Spear {
        tech: u16,
        durability: u8,
        hardness: u8,
        reach: u8,
        sharpness: u8,
        consumption: u8,
    }, // pre-industrial
    Bayonet {
        tech: u16,
        durability: u8,
        hardness: u8,
        reach: u8,
        sharpness: u8,
        consumption: u8,
    }, // industrial
    LightSaber {
        tech: u16,
        durability: u8,
        hardness: u8,
        reach: u8,
        sharpness: u8,
        consumption: u8,
    }, // galactic
}

#[derive(Hash, Eq, PartialEq)]
enum RangeWeapon {
    // fire
    Bow {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        reload: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // pre-industrial
    Firearm {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        reload: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // industrial
    Phaser {
        tech: u16,
        durability: u8,
        range: u8, // range advantage determines extra first strikes before combat
        precision: u8,
        reload: u8,
        ammunition: u8, // bonus firing rounds
        consumption: u8,
    }, // galactic
}

#[derive(Hash, Eq, PartialEq)]
enum PowerArmor {
    // power armor
    Exoskeleton {
        tech: u16,
        armor: u8,
        durability: u8,
        breakthrough: u8,
        consumption: u8,
        mobility: u8,
    }, // late-industrial, early galactic
    MobileSuit {
        tech: u16,
        armor: u8,
        durability: u8,
        breakthrough: u8,
        consumption: u8,
        mobility: u8,
    }, // galactic, gundam
}

#[derive(Hash, Eq, PartialEq)]
enum Equipment {
    Melee(MeleeWeapon),
    Range(RangeWeapon),
    Artillery(Artillery),
    Armor(Armor),
    PowerArmor(PowerArmor),
    Logistics(Logistics),
}

// shock phase - occur often in primitive societies
// fire phase - occur often in advanced societies
#[wasm_bindgen]
#[derive(PartialEq, Serialize, Deserialize)]
pub enum SquadKind {
    // combat unit
    Infantry,
    Robot,
    Tank,

    // trade & supply
    Wagon,
    Colonist, // move troops to uncolonized tiles to colonize the tiles
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub enum CombatStyle {
    Push,    // attack enermy, if possible
    Fill,    // do not attack, fill the front line
    Overrun, // high-mobility armored troops
    Avoid,   // do not engage in combat
}

#[derive(Serialize, Deserialize)]
struct DivisionTemplate {
    squads: Vec<SquadKind>,
    style: CombatStyle,
    is_civilian: bool,
    has_colonist: bool,
}

pub struct Division {
    commander: Option<SpecialistId>,
    template_id: DivisionTemplateId,
    manpower: u32,
    arsenal: HashMap<Equipment, usize>,
    experience: u16,
    cargo: EnumMap<Product, usize>,
    allegiance: NationId,
}

#[derive(Serialize)]
enum DivisionLocation {
    City(CityId),
    Travel {
        vertex_id: PlanetVertexId,
        moved: f32, // percentage moved to next
        path: Vec<u8>,
    },
    InTransport, // TODO attach transport id
}

#[derive(Clone, Serialize)]
struct PlanetEdge {
    vertex_idx: u8,
    cost: u32,
}

pub struct Planet {
    width: u8,
    height: u8,
    name: String,
    orbit: Orbit,

    adj_list: Vec<Vec<PlanetEdge>>, // undirected graph, only keep edges (u,v) where u < v

    // Javascript-facing, view topology
    city_coors: Vec<f32>, // each coordinate is a pair of f32 in the vec, i.e (coor[i], coor[i+1]), i divisible by 2
}

// star revolve around the origin
struct Star {
    name: String,
    orbit_radius: f32,
    radius: f32,
}

struct WarGoal {
    creation_time_left: u32,
    valid_time_left: u32,
}

#[derive(Default)]
struct StationedDivisions(Vec<Vec<HashSet<DivisionId>>>);

#[wasm_bindgen]
#[derive(Default)]
pub struct Galaxy {
    swiss_account: HashMap<SpecialistId, f64>,
    specialists: Vec<Specialist>,

    planets: Vec<Planet>,
    stars: Vec<Star>,
    angles: HashMap<Locatable, f32>,
    locs: HashMap<Locatable, Point2<f32>>,
    loc_idx: HashMap<i32, HashSet<Locatable>>,
    nations: Vec<Nation>,
    player: Option<SpecialistId>,
    ships: Spacecrafts,
    player_nation: usize,

    nation_templates: HashMap<NationId, HashSet<DivisionTemplate>>,
    nation_divisions: HashMap<NationId, HashSet<DivisionId>>,
    division_templates: Vec<DivisionTemplate>,
    divisions: Vec<Division>,
    divisions_in_training: HashMap<NationId, HashMap<DivisionId, u8>>, // planet id -> division in training -> training progress
    divisions_undeployed: HashSet<DivisionId>,                         // trained but not deployed
    public_divisions: HashSet<DivisionId>,
    private_divisions: HashSet<DivisionId>,

    // location mappings for divisions
    stationed_divisions: StationedDivisions, // planet_idx -> vertex_idx -> set of stationed divisions
    division_location: HashMap<DivisionId, DivisionLocation>, // implied divisions are deployed

    wars: Vec<War>,
    war_goals: HashMap<NationId, HashMap<NationId, WarGoal>>,

    cities: Vec<City>,

    // cached view data
    city_graphs: HashMap<PlanetVertexId, CityGraph>,

    // game model's topology
    city_idx_to_vertex_id: Vec<PlanetVertexId>, // city id -> vertex id

    // view-to-model translation
    vertex_idx_to_city_id: Vec<Vec<CityId>>, // planet idx -> vertex idx (view) -> city id (model)
}

#[derive(Default)]
struct FactionData {
    tech: HashMap<TechKind, u32>,
    relationship: HashMap<Faction, i32>,

    // ships
    design: EnumMap<SpacecraftKind, BaseCraftStructure>,
    ownership: EnumMap<SpacecraftKind, HashSet<usize>>,
    fleets: Vec<Fleet>,
    traders: Vec<usize>, // idx of freighter
}

struct Specialist {
    name: String,
    job: Job,
}

impl Default for Specialist {
    fn default() -> Self {
        Specialist {
            name: "No Name".to_owned(),
            job: Job::None,
        }
    }
}

pub enum Job {
    None,
    CEO(CorporationId),
    Governor,
    President,
    FieldMarshall,
    General,
    Manager,
    Worker,
    Trader,
    TransportDriver,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy)]
enum CorpOwner {
    Nation(NationId),
    Colony(ColonyId),
    Corporation(CorporationId),
    Personal(SpecialistId),
}

#[derive(Default)]
struct CorporationDerived {
    operating_map: MinimumSpanningTree<usize>,
}

struct Corporation {
    issued_share: u32,
    name: String,
    incorporated_nation: NationId,
    ownership: HashMap<CorpOwner, u32>, // nation, colony, corp, or person -> number of shares
    faction: FactionData,
    offices: HashSet<usize>, // set of colonies that the corp operates
    derived: CorporationDerived,
}

// TODO automatically store minimum goods for local industries and exports
#[derive(Clone)]
pub enum TradeStrategy {
    Hold,    // do not sell to market; products are exported/consumed by industries
    Free,    // default; sell to the market at fair price, hold surplus
    Dump,    // dump goods to the market regardless of profits
    Destroy, // destroy excess goods after selling enough goods at fair price
}

impl Default for TradeStrategy {
    fn default() -> Self {
        TradeStrategy::Free
    }
}

/*
- usually people have 1 major expertise
- corps hire managers that have the right expertises
- every corporations on every colonies have "worker slots" for every types of industry (think Tropico and Civ)
    - each worker slot represents many workers in real (?) life scale
    - like managers, workers are named characters
    - hiring occur once per year (400 turns)
        - run stable marriage algorithm
- each company need to set up an office to operate on a colony
    - the office comes with a small storage

production:
    - responsible for creating goods to the market
    - control the supply side of the market
- resource
    - produce resources without input materials; tools consumption boost efficiency
    - raw resources: argriculture (crop), mining (metal, gem), refining (fuel)
- manufacturing
    - consume raw materials and secondary products to create finished products; machines consumption boost efficiency
    - finished products: food, drink, apparel, accessory, furniture, gadget, vehicle, tool, machine
    - ship & weapon parts
    - education requirement varies for different products
    - tools boost resource industries greatly
    - machines boost manufacturing greatly, but efficient mass-production require high eduction level

service:
    - control the demand side of the market
    - consume goods to produce service to its colony
    - improves the well-being of the colony
    - generic parameters:
        - supply
            - actual # of goods in storage
        - coverage
            - the portion of demands that are reachable to buyers
            - effectively control the max # of items that can be sold
        - strength
            - determine how many items that can be sold when the market is saturated (more supply than demand)
            - companies that have higher ad. ratings can sell more than others, up to the max defined by the coverage and actual supply
- sales
    - represent either/both retail or wholesales
    - serve as point of supply to citizens
- education
    - consume computers to produce values
    - the larger the donation, the larger the shares of research points
    - professors perform reseach, which randomly generate prestige
        - high prestige make people more likely to enroll to this school
        - increase strength
    - name characters attend college
        - work as research assistant for free
        - increase stats upon graduation
        - increase hiring preference with donated companies
        - earn "idea" points that can be spend to founding advanced industries
- health
    - consume medicine to produce values
    - split effort between medical research (coverage, immunization) and bioenhancement research (strength, military)
    - provide immunization to colony, which counter disease outbreak
- telecom
    - consume computers to produce values
    - construct satellites to improve coverage and strength
    - construct communication stations to link up systems
        - assume signals move in a straight line (this in universe, I am not a physicist)
            - basically point-in-circle test
            - gives possibility of blockades
        - signal range is affected by techs
        - companies can order goods only from linked systems
- construction
    - consume concretes to produce values
    - when other companies invest in buildings
    - increase the rate which colony development reaches its capacity
        - it takes time for other service industries to build up development levels
        - construction firms shorten development time
    - allow to own constructors for space construction

special industries:
- aerospace
    - responsible for all aspects of ship research, design, and production
        - capacity: ships require equipment "points" (weapon, beam, hull, etc.) to be fulfill
        - theoretical max: the max capacity of components of the ship that can be designed
        - capacity serves as demands to the respective goods
        - a functional ship means its components has 100% capacity
    - high barrier to entry
        - entry to market must be approved by the national government
        - then company must build and maintain a shipyard
    - government can order military ships
    - companies can order trade ships
        - maybe some nations pass laws that allow civilian to buy certain military ships
- IT
    - consume computer to generate pure profit
    - highly depend on colony development
    - highly depend on CEO's skills
    - each IT company sells 1 idea
        - multiple companies that sell the same idea would have to compete with each other
        - competition rules for service industries apply
    - the entire galaxy shares an "idea" list, which is a number line from 0 to N
        - N is expanded when a student comes up with an idea
            - students idea points are shared within an university
            - students can found startups, which roll a random idea from 0 to N
                - if the university has enough idea points, the limit of N increases
            - idea points spread quickly
*/

#[derive(Default)]
struct HumanResource {
    workers: HashSet<usize>, // person id
}

struct ServiceParams {
    strength: f32, // advertisement, prestige; factors that affect preference
    coverage: f32, // how "reachable" the service is to customers
    hr: HumanResource,
}

/**
 * Right now, my thought about trading is run a simple flow algorithm on a minimum spanning tree, such that
 * anyone would take the cargo further away from the source
 * - idea: goods "radiate" from a supply source, each temporary destination of goods increases the distance (radius) of the source
 * - metric: distance of 2 nodes in the minimum spanning tree
 * - goods distribution in total, 2 cases:
 *      - if supply > demands, then reserve the needed quantity, and then split the rest proportionally by demands
 *      - otherwise rank the colonies and transport goods to those them greedily
 *          - rank by importance of the goods (say, food, tools, machines, metal)
 *          - rank by $ investment to the colonies
 * - next destination:
 *      - search all colonies that company has storage within radius R
 *      - look for colonies with the highest demands
 */
#[derive(Default, Clone)]
struct RelayQtys {
    total_qty: u32, // sum of quantities from distribution
    distribution: HashMap<usize, HashMap<usize, u32>>, // src idx -> buyer -> positive qty
}

// bookeeping data for the destination
type IncomingQtys = EnumMap<Product, HashMap<usize, u32>>; // fleet id -> positive qty

#[wasm_bindgen]
#[derive(Default, Clone)]
pub struct ProductParams {
    // production
    pub production_capacity: u32,

    // storage - first take from local qty, then take from anything that can be relayed
    strategy: TradeStrategy,
    pub qty: u32,
    relay: RelayQtys,
    incoming: IncomingQtys, // "future" quantities when transport fleets safely arrive

                            // total qty = qty + sum of outgoing quantities
}

#[wasm_bindgen]
#[derive(Default, Clone)]
pub struct Soldiers {
    pub troops: u32,
    pub rifle: u32,
    pub uniform: u32,
    pub saber: u32,
    pub exoskeleton: u32,
}

#[derive(Clone)]
enum ColonyHost {
    Planet(PlanetId),
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash)]
pub enum Direction {
    North,
    South,
    East,
    West,
}

type SupportDecisions = HashMap<SpecialistId, bool>;

enum NationalTopic {
    Leadership {
        candidates: Vec<SpecialistId>,
        support: HashMap<SpecialistId, HashSet<SpecialistId>>,
    },
    ImportTariffs(HashMap<(NationId, Product), (f32, SupportDecisions)>),
    ExportTariffs(HashMap<(NationId, Product), (f32, SupportDecisions)>),
    WarStance(HashMap<NationId, SupportDecisions>), // if at war, offer peace; if at peace, declare war
}

struct NationalLeadership {
    person: usize,
    legitimacy: f32, // [0,1]
    inaugurate_date: u64,
}

// each unit determines how much equipments and manpowers are needed
#[derive(Default, Clone)]
struct ArmyComposition {
    melee: u32,
    range: u32,
    seige: u32,
    cavalry: u32,
}

struct War {
    aggressors: HashMap<NationId, u32>,
    defenders: HashMap<NationId, u32>,
}

#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq)]
pub enum AccessRight {
    None,
    Civilian,
    Military, // implies civilian
}

#[derive(Clone)]
struct Foreign {
    relation: i32,
    access: AccessRight,
}

struct Nation {
    colonies: HashSet<ColonyId>,
    name: String,
    faction: FactionData,
    topics: VecDeque<NationalTopic>,
    prev_discuss_date: u64,

    leader: Option<NationalLeadership>,
    political_parties: Vec<SpecialistId>,

    // internals
    stability: u32,
    war_support: u32,
    corruption: u32,

    foreign: Vec<Foreign>,
    wars: Vec<WarId>,

    // tax
    income_tax: f32,
    inheritance_tax: f32,
    import_tariffs: HashMap<NationId, EnumMap<Product, f32>>,
    export_tariffs: HashMap<NationId, EnumMap<Product, f32>>,

    // values; kind of like EU3's sliders
    power: u8, // 0 means despotism, 255 means democracy; affect who can vote and what position can be voted for; affect legitimacy
    labor: u8, // 0 means slavery, 255 means well-compensated workers; affect corporation spending, development, production efficiency
    freedom: u8, // 0 means totalitarian, 255 means liberal; affect stability and consumption
    tradition: u8, // 0 means intolerant, 255 means innovative; affect stability and research
    ownership: u8, // 0 means state-controlled, 255 means laissez-faire; affect efficiency of state-controlled corps and private companies
    trade: u8, // 0 means protectionism, 255 means free trade; affect caps of tariffs, transfer of technology
    culture: u8, // 0 means elistism, 255 means egalitarian; affect assimilation of foreign culture, penalties of foreign presence
}

type ProductMapU = EnumMap<Product, u32>;

#[wasm_bindgen]
#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Enum, Serialize, Deserialize)]
pub enum Product {
    // raw materials
    Crop,     // to food, chemical (seasonal high-yield harvest)
    Metal,    // to vehicles, machines, weapons
    Gem,      // to accessory, weapons
    Fuel,     // fuel for spacecraft, power plant
    Concrete, // for construction, production chain isn't modeled in this game
    Supply,   // from common goods

    // intermediate
    Alloy,    // from metal
    Fiber,    // from crop
    Chemical, // to medicine & hull, from crop
    Circuit,  // to gadget, computer, from alloy

    // common goods
    Food,      // from crops
    Apparel,   // from fiber
    Medicine,  // from chemical
    Computer,  // from circuit
    Accessory, // from gems
    Furniture, // from fiber
    Vehicle,   // from alloy

    // operational
    Machine, // from alloy and computers, used by industries
    Tool,    // from metal, used for raw material production

    // spacecraft components
    Hull,   // from alloy & chemical
    Engine, // from alloy & gem

    // ship weapons
    Weapon,         // from alloy and gem
    Shield,         // from alloy and gem
    Armor,          // from alloy and gem
    Countermeasure, // from alloy and gem

    // solder equipments
    Rifle,       // from alloy
    Uniform,     // from fiber
    Saber,       // from alloy & gem; think light saber
    Exoskeleton, // from chemical & fibers
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
enum PlanetKind {
    Ice,
    Aquatic,  // bonus food
    Rock,     // bonus metal
    Gas,      // bonus fuel
    Volcanic, // bonus gem
}

// tech increase cost lineary & effectiveness with deminishing returns
#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
enum TechKind {
    // spacecraft
    Hull,
    Armor,
    Shield,
    Weapon,
    Engine,
    Spacecraft,

    // fleet combat (for admirals)
    SpaceCoordination, // increase #ships in fleet
    SpaceTactics,      // increase flagship influence range (ships perform better within range)

    // solder

    // colonization
    Adaptability(PlanetKind),
    Construction(PlanetKind), // increase speed of construction

    // industry
    Automation(Product),      // reduce cost of labor
    EnergySaving(Product),    // reduce energy usage per unit of industrial capacity
    ResourceSaving(Product),  // reduce resource usage
    Manufacturing(Product),   // increase throughtput (also use more input resource)
    SpaceProduction(Product), // reduce penalty for manufacturing in space station
}

#[wasm_bindgen]
#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Enum, Serialize, Deserialize)]
pub enum SpacecraftKind {
    // small spacecrafts that can be assembled, docked, repaired on planets
    Freighter, // trade ships
    Fighter,   // beam-based ships
    Bomber,    // missile-base ships
    Trooper, // transport troops for planetary conquest, single-use landing (think of the spacecraft as a base of operation, providing cover and support fire for troops)

    // medium spacecrafts that can be assembled; can only dock on shipyard station
    Destroyer,    // main unit, beam-based ships
    BombardCraft, // missile-based; AOE damage that affect everyone in range; can bomb planets,
    Battleship,   // use super weapons (slow-reloading, high-throughput)

    // large spacecrafts that serve for strategic purposes; each has a local market (fixed price & qty) for resupply; limited production capacity
    Station,  // colonies in space
    Fortress, // somewhat mobile space fortresses that shoot super long range, super wide-area attacks
    Carrier,  // mainly serve as a repair & supply base for fighters and bombers
    Shipyard, // repair + upgrade + all ships production

    // special large ship that can be built on planets (to bootstrap the first shipyard)
    Constructor, // construct station or shipyard; or repair
}

#[derive(Default)]
struct Spacecrafts {
    // data
    freighters: Vec<Freighter>,
    fighters: Vec<BaseCraft>,
    bombers: Vec<BaseCraft>,
    construstors: Vec<Construstor>,
    troopers: Vec<Trooper>,
    destroyers: Vec<BaseCraft>,
    bombard_crafts: Vec<BaseCraft>,
    battleships: Vec<BaseCraft>,
    stations: Vec<Station>,
    fortresses: Vec<Fortress>,
    carriers: Vec<Carrier>,
    shipyards: Vec<Shipyard>,
}

struct Fleet {
    composition: EnumMap<SpacecraftKind, u32>,
    ships: EnumMap<SpacecraftKind, u32>,
}

#[derive(Default)]
struct BaseCraftStructure {
    // structure
    weapon: u32,
    shield: u32,
    shield_charge: f32,
    hull: u32,
    engine: u32,

    // consumable
    ammunition: u32,
    fuel: u32,

    // boarding
    crew: Soldiers,
}

#[derive(Debug, PartialEq, Eq, Hash)]
enum Faction {
    Nation(NationId),
    Corporation(CorporationId),
}

struct BaseCraft {
    design_faction: Faction, // determines the max
    owner: Faction,
    structure: BaseCraftStructure,
    coor: Point2<f32>,
}

struct DockingRings {
    ships: Vec<(usize, u8)>,              // ship id, undock count-down
    land_requests: VecDeque<(usize, u8)>, // ship id, dock count-down
    parts: u16,
}

struct Freighter {
    space_craft: BaseCraft,
    storage: ProductMapU,
}

struct Station {
    space_craft: BaseCraft,
    colony: usize,
    orbit: Option<Orbit>, // revolve around a star when anchored
    docking_rings: DockingRings,
}

struct Trooper {
    space_craft: BaseCraft,
    soldiers: Soldiers,
}

struct Carrier {
    space_craft: BaseCraft,
    storage: ProductMapU,
    docking_rings: DockingRings,
    hanger: DockingRings, // hold small spacecrafts, provide repair
}

struct Fortress {
    space_craft: BaseCraft,
    storage: ProductMapU,
    docking_rings: DockingRings,
}

struct Construstor {
    space_craft: BaseCraft,
    storage: ProductMapU,
    docking_rings: DockingRings,
    target: (SpacecraftKind, usize),
}

struct ConstructionYards {
    queued_projects: VecDeque<SpacecraftKind>,
    ships: Vec<(SpacecraftKind, ProductMapU, u32)>, // ship kind, resource delivered, assemble progress
    parts: u16,
}

struct Shipyard {
    space_craft: BaseCraft,
    storage: ProductMapU,
    queued_projects: VecDeque<SpacecraftKind>,
    docking_rings: DockingRings,
    construction_yards: ConstructionYards, // provide repair & constructions
}

#[wasm_bindgen]
pub fn bootstrap() {
    extern crate console_error_panic_hook;
    use std::panic;
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}
