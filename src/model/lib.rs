#![feature(self_struct_ctor)]
#![feature(non_ascii_idents)]

#[macro_use]
extern crate lazy_static;
extern crate strsim;
extern crate wasm_bindgen;
extern crate wbg_rand;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate enum_map;
extern crate delaunator;
extern crate kdtree;
extern crate nalgebra;
extern crate ordered_float;
extern crate rand;

pub mod cal_state;
pub mod colony;
pub mod constants;
pub mod coor;
pub mod division;
pub mod galaxy;
pub mod id;
pub mod interop;
mod kruskal;
mod mapping;
pub mod nation;
pub mod planet;
mod product;
pub mod search;
mod unionfind;
mod units;
mod util;

use colony::Industry;
use coor::CartesianCoor;
use coor::PolarCoor;
use enum_map::EnumMap;
use kdtree::KdTree;
use product::Product;
use std::collections::{HashMap, HashSet, VecDeque};
use std::hash::Hash;
use units::transporter::Transporter;
use util::distance_point_segment;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[derive(Clone)]
pub struct CityGraph {
    pub num_structures: u8,
    points: Vec<f32>,
    dims: Vec<f32>,
    roads: Vec<u8>,
}

#[wasm_bindgen]
impl CityGraph {
    pub fn get_points(&self) -> Vec<f32> {
        self.points.clone()
    }

    pub fn get_dims(&self) -> Vec<f32> {
        self.dims.clone()
    }

    pub fn get_roads(&self) -> Vec<u8> {
        self.roads.clone()
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

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(msg: &str);
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct CorporationId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct PeopleId(usize);

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
pub struct CityId(u32);

#[derive(Debug, PartialOrd, Ord, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct FleetId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct WarId(usize);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct PlanetVertexId {
    planet_id: PlanetId,
    vertex_id: VertexId,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct ColonyId {
    planet_idx: u16,
    colony_idx: u16,
}

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct VertexId(u8);

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct SpacecraftId {
    kind: SpacecraftKind,
    idx: usize,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub struct TransporterId(usize);

#[derive(Debug, Serialize, Deserialize)]
pub enum Id {
    Corporation(CorporationId),
    Specialist(PeopleId),
    Planet(PlanetId),
    Star(StarId),
    Nation(NationId),
    Colony(ColonyId),
    Spacecraft(SpacecraftId),
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
pub enum Locatable {
    City(CityId),
    Planet(PlanetId),
    Star(StarId),
    Fleet(FleetId),
}

// roles only have effects when enough facilities support them
#[derive(Enum)]
pub enum Role {
    // tier 0
    Criminal, // negatively affect society, destroy facilities over time
    Beggar,   // low consumption, increase instability

    // tier 1, uneducated
    Unemployed, // normal consumption, but quickly demote to tier 0 roles
    Pioneer,    // low consumption; act as laborer, artisan and engineer for low population colonies
    Laborer,    // increase goods production

    // tier 2, require education
    Engineer,   // increase facility points
    Teacher,    // increase literacy rate
    Researcher, // produce research points
    Police,     // increase safety
    Doctor,     // increase health
    Bureaucrat, // increase political power

    // tier 3
    Elite, // high consumption; effect depends on government type

    // manpower contribution to units
    Pirate,  // tier 0, contribute to pirate's draftable manpower
    Trader,  // tier 1, transport goods among cities and planets; not controlled by the player
    Soldier, // tier 1, basically for "resupplying" military units' HP; controlled by the player
    Officer, // tier 2, required to organize an army
}

#[derive(Enum)]
pub enum Facility {
    Cottage,   // provide more living space than other facility kind
    School,    // offer jobs to teachers
    Lab,       // offer jobs to researchers
    Police,    // offer jobs to police
    Hospital,  // offer jobs to doctors
    Assembly,  // offer jobs to bureaucrats
    Mansion,   // house more elites
    Fort,      // add defense to the city
    Warehouse, // add storage to the city
}

pub enum EducationLevel {
    Uneducated,
    Educated,
    WellEducated,
    HighlyEducated,
}

pub struct SocialGroup {
    role: Role,
    culture: CityId,
    population: u32,
    education_level: EducationLevel,
}

#[derive(Default)]
pub struct Population(Vec<SocialGroup>);

#[derive(Default)]
pub struct City {
    population: Population,

    // factors that affect development growth
    consumption_lvl: f32,    // civilian consumption
    education_lvl: f32,      // education level
    health_lvl: f32,         // health level
    safety_lvl: f32,         // safety level
    infrastructure_lvl: f32, // infrastructure level
    energy_lvl: f32,         // energy utilization
    telecom_lvl: f32,

    educated: u32, // uneducated = population - educated
    facilities: EnumMap<Facility, usize>,
    num_facilities: usize,
    facility_points: usize,
    industry: Industry,

    development: usize, // capped by population and tech

    influence: HashMap<NationId, f32>,
    tech: EnumMap<TechKind, u32>,

    transporters: Vec<TransporterId>,

    owner: Option<NationId>,
    controller: Option<NationId>,
}

#[derive(Copy, Clone, PartialOrd, Ord, PartialEq, Eq, Hash)]
pub struct SortedEdge<T>(T, T)
where
    T: Copy + Clone + PartialOrd + Ord + PartialEq + Eq + Hash;

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
    style: CombatStyle,
    num_infantry_squads: usize,
    num_artillery_squads: usize,
    num_tank_squads: usize,
    max_speed: usize,
    max_morale: usize,
    is_civilian: bool,
}

#[derive(Eq, PartialEq, Ord, PartialOrd)]
pub struct EquipmentKey {
    tech_level: usize,
    variant_total: usize,
}

pub trait EquipmentVariant {
    /// Returns the sum of variant points that the variant has spent.
    fn sum(&self) -> usize;
}

enum DivisionFocus {
    Normal, // default; if a nation has enough equipments and a sound logistics system, all divisions get the same amount of equipments
    High,   // division gets reinforced first
}

impl Default for DivisionFocus {
    fn default() -> Self {
        DivisionFocus::Normal
    }
}

#[derive(Default)]
struct DivisionFocii {
    // melee focus = High by default
    range: DivisionFocus,
    armor: DivisionFocus,
}

pub struct Division {
    commander: Option<PeopleId>,
    template_id: DivisionTemplateId,
    focii: DivisionFocii,
    morale: u32,
    soldiers: HashMap<CityId, u32>,
    experience: u16,
    storage: EnumMap<Product, usize>,
    allegiance: NationId,
}

pub struct DivisionStats {
    /*
    shock_damage: u32,  // melee attack
    fire_damage: u32,   // range attack
    pierce_damage: u32, // reduction of enemy armour
    shock_defense: u32,
    fire_defense: u32,
    */
    attack: u32,
    defense: u32,
    speed: u32,
    // armour: u32,
}

pub struct DivisionDamage {
    shock: u32,  // melee attack
    fire: u32,   // range attack
    pierce: u32, // reduction of enemy armour
}

#[derive(Serialize)]
enum DivisionState {
    City(CityId),
    Travel {
        planet_vertex_id: PlanetVertexId,
        moved: f32, // percentage moved to next
        path: Vec<VertexId>,
    },
    Retreat {
        planet_vertex_id: PlanetVertexId,
        moved: f32, // percentage moved to dest
        dest: u8,
    },
    InTransport, // TODO attach transport id
}

#[derive(Serialize)]
enum DivisionPlanetMovement {
    Stay,
    Travel { path: Vec<u8> },
    Retreat { dest: u8 },
}

#[derive(Clone, Serialize)]
pub struct PlanetEdge {
    vertex_id: VertexId,
    cost: u32,
}

struct Frontline {
    is_attacking: bool, // divisions move to new positions and readjust frontline
    nation_id: NationId,
    line_vertices: HashSet<usize>,
    goals: HashSet<usize>, // auto recreate frontline when attacking
    assigned_divisions: HashSet<DivisionId>,
}

pub struct PlanetAdjList(Vec<Vec<PlanetEdge>>); // undirected graph

pub struct Planet {
    name: String,

    radius: f32,
    star_system: StarId, // origin
    coor: PolarCoor,

    adj_list: PlanetAdjList,

    city_coors: Vec<f32>, // each coordinate is a pair of f32 in the vec, i.e (coor[i], coor[i+1]), i divisible by 2

    shortest_paths: Vec<Vec<Option<(VertexId, u32)>>>,

    frontlines: Vec<Frontline>,
}

pub enum StationKind {
    Settlement(CityId),
    Factory(Product),
}

pub struct Station {
    revolve_around: Locatable,
    coor: PolarCoor,
    city_id: CityId,
}

// star revolve around the origin
struct Star {
    name: String,
    radius: f32,
    coor: PolarCoor, // origin is (0,0)
    planets: Vec<PlanetId>,
}

struct WarGoal {
    creation_time_left: u32,
    valid_time_left: u32,
}

#[derive(Default)]
struct StationedDivisions(Vec<Vec<HashSet<DivisionId>>>);

#[derive(Default)]
pub struct Wars(Vec<War>);

pub struct LocationIndex(KdTree<f64, Locatable, [f64; 2]>);
impl Default for LocationIndex {
    fn default() -> Self {
        LocationIndex(KdTree::new(2))
    }
}

#[derive(Default)]
pub struct VertexToCityId(Vec<Vec<CityId>>);

#[derive(Default)]
pub struct CityIdToVertex(Vec<PlanetVertexId>);

#[wasm_bindgen]
#[derive(Default)]
pub struct Galaxy {
    timestamp: u64,
    swiss_account: HashMap<PeopleId, f64>,

    planets: Vec<Planet>,
    stars: Vec<Star>,
    stations: Vec<Station>,
    loc_idx: LocationIndex,
    nations: Vec<Nation>,
    player: Option<PeopleId>,
    player_nation: usize,

    fleets: Vec<Fleet>,

    nation_templates: HashMap<NationId, HashSet<DivisionTemplate>>,
    nation_divisions: HashMap<NationId, HashSet<DivisionId>>,
    division_templates: Vec<DivisionTemplate>,
    divisions: Vec<Division>,
    divisions_in_training: HashMap<NationId, HashMap<DivisionId, u8>>, // planet id -> division in training -> training progress
    division_locations: HashMap<DivisionId, (f32, f32)>,

    // location mappings for divisions
    stationed_divisions: StationedDivisions, // planet_idx -> vertex_idx -> set of stationed divisions
    // division_location: HashMap<DivisionId, DivisionLocation>, // implied divisions are deployed
    vertex_to_divisions: HashMap<PlanetId, HashMap<u8, HashSet<DivisionId>>>,

    wars: Vec<War>,
    war_goals: HashMap<NationId, HashMap<NationId, WarGoal>>,

    battles: HashMap<PlanetId, HashMap<u8, HashMap<u8, HashSet<DivisionId>>>>, // planet -> vertices for defending units -> attacking vertices -> attackers

    cities: Vec<City>,
    transporters: Vec<Transporter>,

    // cached view data
    city_graphs: HashMap<PlanetVertexId, CityGraph>,

    // game model's topology
    city_id_to_vertex_id: CityIdToVertex, // city id -> vertex id

    // view-to-model translation
    vertex_idx_to_city_id: VertexToCityId, // planet idx -> vertex idx (view) -> city id (model)
}

#[derive(Default)]
struct FactionData {
    relationship: HashMap<Faction, i32>,
    fleets: Vec<Fleet>,
    traders: Vec<usize>, // idx of freighter
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy)]
enum CorpOwner {
    Nation(NationId),
    Colony(ColonyId),
    Corporation(CorporationId),
    Personal(PeopleId),
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

#[wasm_bindgen]
#[derive(Default, Clone)]
pub struct Soldiers {
    pub troops: u32,
    pub rifle: u32,
    pub uniform: u32,
    pub saber: u32,
    pub exoskeleton: u32,
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash)]
pub enum Direction {
    North,
    South,
    East,
    West,
}

type SupportDecisions = HashMap<PeopleId, bool>;

enum NationalTopic {
    Leadership {
        candidates: Vec<PeopleId>,
        support: HashMap<PeopleId, HashSet<PeopleId>>,
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
    political_parties: Vec<PeopleId>,

    // internals
    stability: u32,
    war_support: u32,
    corruption: u32,

    foreign: Vec<Foreign>,
    wars: Vec<WarId>,

    tax_rate: f32,

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

pub type ProductQty = EnumMap<Product, u32>;

#[derive(Debug, PartialEq, Eq, Hash, Clone, Copy, Serialize, Deserialize)]
enum PlanetKind {
    Ice,
    Aquatic,  // bonus food
    Rock,     // bonus metal
    Gas,      // bonus fuel
    Volcanic, // bonus gem
}

// tech increase cost lineary & effectiveness with deminishing returns
#[derive(Debug, Enum)]
enum TechKind {
    // spacecraft
    Hull,
    Armor,
    Shield,
    Weapon,
    Engine,
    Spacecraft,

    // fleet combat
    SpaceCoordination, // increase #ships in fleet
    SpaceTactics,      // increase flagship influence range (ships perform better within range)

    // planetary warfare
    Melee,
    Range,
    Artillery,
    Tank,
    PowerArmor,

    // colonization
    Adaptability,
    Construction, // increase speed of construction

    // industry
    Automation,      // reduce cost of labor
    EnergySaving,    // reduce energy usage per unit of industrial capacity
    ResourceSaving,  // reduce resource usage
    Manufacturing,   // increase throughtput (also use more input resource)
    SpaceProduction, // reduce penalty for manufacturing in space station
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

#[derive(Debug, Default)]
struct FleetData {
    tech: u32,           // can retrofit to higher tech level
    desired_factor: u32, // automatically place orders to shipyards
    actual_qty: u32,     // the actual amount of spacecrafts in the fleet
}

#[derive(Debug, Clone, Copy)]
enum TravelTarget {
    Coor(CartesianCoor),
    City(CityId),
}

enum FleetAction {
    Travel(TravelTarget),
}

#[derive(Debug, Clone, Copy)]
enum FleetState {
    Docked(CityId),
    Undocking(CityId),
    Travel(CartesianCoor, TravelTarget),
    Ready(CartesianCoor),
}

struct Fleet {
    composition: EnumMap<SpacecraftKind, FleetData>,
    cargo: EnumMap<Product, u32>,
    state: FleetState,
    actions: VecDeque<FleetAction>,
}

#[derive(Debug, PartialEq, Eq, Hash)]
enum Faction {
    Nation(NationId),
    Corporation(CorporationId),
}

#[wasm_bindgen]
pub fn bootstrap() {
    extern crate console_error_panic_hook;
    use std::panic;
    panic::set_hook(Box::new(console_error_panic_hook::hook));
}
