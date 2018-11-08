player:
- travel to a different planet
- operate corps (if in corp HQ)
    - invest into buildings
    - set pricing strategy
- lobby
    - invest into infrastructure
    - donation for welfare building
    - involve in politics

planet:

colonies:
- link to a space port & elevator
- development of linked colonies affect price
- each faction can have at most 1 storage per colony, with an associated market share
    - all storages from space port's associated colonies act as 1 market
    - owner marks goods that can exported
- each tile has a land value, affected by planet beauty, nearby zones

- buy/sell algorithm
    while demand > 0 and supply > 0
        from low to high market share
            qty sold = min(supply, floor(quantity * market share))
        highest sell the rest

buyer: demand 5
corp 1: supply 20, market share 0.41
corp 2: supply 10, market share 0.49
corp 3: supply 10, market share 0.10

round1 
    corp3 sold = min(10, floor(5 * 0.10)) = 0
    corp1 sold = min(10, floor(5 * 0.41)) = 2
    total so far = 2, rest:
    corp2 sold = min(10, 5 - 2) = 3
    all sold

buyer: demand 30
corp 1: supply 5, market share 0.21
corp 2: supply 6, market share 0.49
corp 3: supply 10, market share 0.10
corp 4: supply 3, market share 0.20

round1
    corp3 sold = min(10, floor(30 * 0.10)) = 3, 7 remain
    corp4 sold = min(3, floor(30 * 0.20)) = 3, sold out
    corp1 sold = min(5, floor(5 * 0.21) = 1, 4 remain
    rest:
        demand1 = demand - sold = 30 - 7 = 23
    corp2 sold = min(6, demand1) = 6, sold out
    13 sold, demand = 17
round2
    total share = 0.21 + 0.1 = 0.31
    corp3 sold = min(7, floor(17 * 0.10 / 0.31)) = 5, 2 remain
    rest:
        demand1 = demand - sold = 17 - 5 = 12
    corp1 sold = min(4, demand1) = 4, sold out
    9 sold, demand = 8
round3
    rest
        demand1 = demand - sold = 8 - 0 = 8
    corp3 sold = main(2, demand1) = 2, sold out
    demand = 6
    all sold


industry:
- each zone has somewhat fixed demand & potential supply
- production & cost affected by
    - raw materials & demand satisfaction
    - power
    - tech
    - city's avg infrastructure
    - intercity (railroad) connection to spaceport
    - colony education affect cost (no bonus to production, but a certain level of education is required to operate)

trade:

relationship b/w public & private factions

- public
	- politics, markets
	- collection of private factions
    - set up rules, diplomacy
    - set up grand-strategy military
    - fund new private factions (corporations)
    - set up militia & planet defense
    - constructions
- private
	- have allegiance to 1 public faction
    - perform "real" work:
        - sponsor colonization
        - lobby for constructions
        - sponsor militia & planet defense

market
each zone has a preference (based on influence of faction of the colonial government)
each colonial government has a preference of each zone (based on zone allegiance and victory point)

for each zone from high to lowest victory point
    pick the government with the highest 

each corp's need is counted as gov's demand
each corp's production is counted as gov's supply
gov first try to fulfill corps' demand then civilian
any surplus goes to an artificial "common" market

investment:
- each point of investment provide 1 base industrial point
- more investment on the same zone increase effectiveness of base, maybe with deminishing returns capped at 100% bonus
- each turn corps need to need pay wages to every industry investments
    - wage proportional to development and population


corp, as CEO:
- can can buy other companies' stocks
- can only set budgets
    - per planet, spending affect ranking that affect's company's buy/sell priority
        - marketing
            - ads. fees have a maximum that the planet can handle, company can pay for at most 100 "parts"
            - (TODO?) effectiveness depends on telecom rating
            - deminishing returns
            - project 30% influence
        - donations
            - money goes into politician's pocket
            - again divided in 100 parts, relative to politician's wealth
            - deminishing returns
            - project 30% influence
        - public construction
            - fund expensive construction projects that benefit the people in the long-term
            - no limit, no decay
            - strength relative to other corps
            - project 40% influence
        - the rest goes to expanding industry, if necessary
- set up transports & hire mercenary
        
colonial gov:
- set tax rate, tariffs, subsidies
- can set budget for the planet, like Superpower 2
- can embezzle money (corruption is legal action in the game), split the money with government-related personals
- set up militia
- fund privateers; issue "letter of marque" space-version
    - signing nation won't attack the pirates, and vice-versa
    - letter expires when nation is at peace
    - nation can either enlist the privateers (pay them fixed rates while at peace) or they become pirates, free-for-all
    - (TODO?) privateers can cancel the letter if loyalty is low

head of state:
- set "federal" tax rate, tariffs against foreign countries
- can embezzle money (corruption is legal action in the game), split the money with government-related personals
- set up military
- can bring use issues for discourse
    - war/peace
    - non-aggression
    - trade treaties
    - foreign investment treaties
    - R&D direction, like civ games

pirates/privateers
- extra buffs for being pirates/privateers
- can set up station-colonies in distant areas
- can set up criminal network on planets
- set up attack fleets that rob enemies
- set up smuggling fleets that are neutral to everyone, bypass tariffs
- bribe governors for pardons
- can become a real nation if taken control over a planet
- set up area of plunder

flow of game
- each job unlocks actions
- the player can perform actions any time
- the ai perform actions at fixed interval

economy & industry
- private factions invest money to build farm/industry/mines/etc on planets, represented as industry points
- private pay wages to zones each turn
- private gain goods through production and sell them
- zones buy consumer goods with savings (resource sink)
- rinse and repeat

- planets have zones
- each planet has global modifier
- each zones have industrial capacity
- companies buy zones' industrial capacity though investing (like buying shares)

Ships & Fleets & Trade routes
- large spacecrafts won't be removed from the map, but can be scrapped/repaired by constructors
- trader (single-ship)
    - faction has an operation map, which consists of
        - faction's owned/invested planets
        - large ships
    - kinds of traders
        - free trader - arbitrage: at the current docked market, find a destination and trade products that yield the highest profit margin
        - system transporters - transport goods within a star system
        - inter-system transporter - build a minimum spanning tree from the operation map and spread out goods between vertices; reset the tree once a while

Multiple factions on a planet
- planet
    - type (continental, ocean, ice, gas)
    - territory - determine how many buildings can be constructed
    - atmosphere
    - base habitability
    - maybe extra bonus
- colony
    - occupied territory
    - stability
    - war support
    - influence
    - population
    - development
    - industry
    - militia & equipment stockpile
    - defense
    - reasearch
- planetary bombardment (from space)
    - reduce defense and everything else

Planetary Gameplay
- assumption: all nations on a planet are connected to each other
- each colony recruit its own solders
    - each colony has its own stockpile of equipments that decays over time
    - each colony assign soldiers to the border that is shared with other nations
    - priority of solder assignment affected by diplomacy at the national level
- or colony can focus its effort towards development
- warscore represents contribution to the war against *one* enemy; say a country on 1 side has separate counters against its enemies
- when at war, a colony can make 2 choices
    - attack - increases warscores against the country, but may suffer heavy loss against defending enemies
    - defend - hold the ground, at the cost fortification and, if running out of forts, warscores
- countries that are at war lose war support and, if war support is low, stability
- the lossing side will surrender after its surrender threshold reached
- the winning side split the loser's territory proportional to their warscores
- the peace deals are done in a per-planet basis, so a colony may have surrenderred but its country can try to retake the colony
- national influence on the planet for the surrendered colony remains forever; though the owner of the planet can lower foreign influence through assimilation; or by enlarging the owner's influence

TODO
create starting people, colonies, nations, corporations
basic simulation with the given
add trade
add ability to spawn corps and colonies
add warship, warfare, pirates
add ability to spawn nation
add diplomacy
add research
add "modifiers"



tactics increase combat width (CW)

shared borders = # simultaneous combats
tech increases # combat rounds

combat power per border (B) = total power / # shared borders
effective combat power = min(B, CW)

army composition determines bonus power (on top of effective combat power)

on top of professional army, each side has militia/partisans backups from population
	- size of militia based on influence
	- militia/partisans die first, then pros

attack: equipment +/* other modifiers
defense: equipment +/* other modifiers

damage to manpower = max(0, attack - defense)
damage to equipment = ceil(damage to manpower * army composition)

dice rolls (1d9), face values provide linear bonus to attack

combat width 

cannot attack when strength < 20%
defender surrenders tile when out-strengthed 4-to-1

nations form blobs on a planet
troops can only walk on blobs
automatically fill front line
combat done by flood-filling the frontline; attack only when advantageous

TODO

city population breakdown:
- base population
    - affect population growth - the higher the base, the higher growth
    - 3 social classes, affect consumption demands
        - rich
        - middle class
        - poor
- consripts
    - determined by troops on the battlefield & conscription law (like hoi4)
- colonists
    - determined by unhappiness
- specialists
    - maybe linearly proportional to base population
    - 

planetary:
colony - each nation generate
industry
consumption
transport
unit move & attack
nation

galactic:


add nations

national membership kinds
- Core members
    - starting state
    - confederated states
    - promoted from states with high influence
- Accepted members
    - states with ok influence
- Puppet
    - newly conquered states

bloc member absorption happen 1 state by 1 state (not the entire nation)
    - 2 ways to absorb sphered states:
        - confederation due to high threat
        - integration may happen when only 1 bloc exists on a planet

bloc membership kinds (collection of nations)
- leader
    - decide diplomatic actions for the whole bloc
- satellite
    - 
- sphered
    - like Victoria 2
    - not affected by war declaration
    - focus trade with leader and then members

- each city is its own state
- a nation is an umbrella of states
- each state has an influence value to the nation (state power)
    - has a say to policy reforms
    - factors
        - capital
        - national focii
        - victory points
        - membership kind
- each nation has an influence to states (national influence)
    - affect states' loyalty to the nation
    - destroyed nations' influence is saved as "local_influence"
        - used in deciding desire for independence & civil wars
        - does not affect the capital

type of wars
- conquest

add diplo actions
	- war justification
	- improve relation
	- marriage (pre-industrial, despotic), until death of leader
	- confederate
		- needs to pass a high threshold
			- e.g. civil war
			- existential threats (unite planet against aliens)
            - highly economically dependent


relationship
- passing rights
	- trade passing rights
	- military passing rights
- military direction
	- declare war
	- non aggression
	- alliance
        - happen between bloc leaders or nations that are not in a bloc
        - join defensive wars or face penalties
        - can drag others into offensive wars

- "currencies"
	- credits
		- range of values: plus or minus 10x GDP
		- order units
		- spend credits to expand nation developments
	- weapons
		- 

- two phases
	- planning phase
		- game is freezed; player perform actions to base
		- build/colonize cities
	- action phase
		- game can be paused during action phase
		- can only change unit destination

unit types:
land
	- operate on planets only
	- can only travel through predefined edges
	- number of divisions determined by infrastructure
spacecraft
	- operate in outerspace
	- small spacecrafts has direct movement between any 2 vertices

map:
planet
galaxy

nation parameters:
trader

create fleet





































