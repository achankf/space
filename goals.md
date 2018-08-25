
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