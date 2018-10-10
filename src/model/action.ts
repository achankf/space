/*
    when a person dies
        - a family member (randomly generated) takes over, and have to pay inheritance tax
    common actions
        - travel to colony or station
        - invest in stock markets
        - can start a business, if rich enough
        - controls one private fleet (at least 1 ship), can hire others
        - can trade, hunt pirates; without the shooter elements of typical space sims
    as top stock holders (> 5%)
        - set up and vote for issues
            - a new CEO, and his/her pay
            - dividends (quarterly)

    everyone can perform all of the above, but can only have one of the following jobs

    as CEO
        - set up subsidiaries (buy land, order constructions)
        - invest in stock markets, real estate, new factories, new stations
    as head of colony
        - gain political power
        - set income rate, proportional to colonies' tax income, at the cost of popularity
        - set colony tax rate (affect popularity)
        - fund public buildings
        - set up colonial policies
    as head of planet
        - gain political power
        - set up planetary policies
        - set colony-planet budget balance
            - determines the proportion that colony tax goes to the planet's treasury
            - budget split between research, welfare, defense, subsidies
        - set direction of research (big TODO)
        - set up militia and defense fleets
        - fend off invasions and pirate raids
        - set up subsidies
        - trade agreements (what can('t) be traded to other planets)
    as head of state
        - is head of planet of the capital
        - gain political power
        - pass policies (have final say; rejection may have consequences)
        - set national focii (target planets get bonuses)
        - assign field marshall
        - diplomacy with other nations
    as field marshall
        - at peace time, set up training
        - or at war time, draw invasion plans
        - promote generals (under head of state's consent)
        - create/disband/merge fleets
    as general
        - controls one fleet, general's order is absolute
        - take invasion plans as hints but is free to act
    as worker
        - stable income but no freedom (just wait until rich enough to start a new business)
    as
    // TODO pirates
*/

/*
export function performActions(galaxy: IGalaxy, personId: symbol, personData: Readonly<IPeople>) {

if poor {
    find a job if available

    if job is good {
        invest in stocks
    } otherwise {
        find another job
        look for sponsors and become a pirate
    }
} else if middle class {
    if not in politics {
        start a business or become a trader
        expand business
    } otherwise { // lucky to find such job and advanced
        expand political influence
        invest more into stocks
    }
} otherwise rich {
    delegate business to others
    expand political influence
}

if is a major stock holder (>5%) {
    check relation with CEO, try to replace him/her low relation
    try to maximize dividend
}

- invest in stock markets
- can start a business, if rich enough
- controls one private fleet (at least 1 ship), can hire others
- can trade, hunt pirates; without the shooter elements of typical space sims
as top stock holders (> 5%)
- set up and vote for issues
    - a new CEO, and his/her pay
    - dividends (quarterly)

// travel if necessary

// start a business

switch (personData.job) {
    case Job.CEO:
        break;
    case Job.FieldMarshall:
        break;
    case Job.General:
        break;
    case Job.HeadOfColony:
        break;
    case Job.HeadOfPlanet:
        break;
    case Job.HeadOfState:
        break;
    case Job.Worker:
        break;
    default:
        throw new Error("not handled");
}
}
*/
