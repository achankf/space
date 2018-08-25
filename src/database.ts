import { Dictionary, distance, makePair, makeSet, Trie, unionMut, Vec2D, wrapIt } from "myalgo-ts";
import { performActions } from "./model/action";
import { IGalaxy } from "./model/def";
import { calCoorHash, calNextState, calTrue2DHash, getMass } from "./model/galaxy";
import { MIN_GRID_SIZE, TabData, TabKind } from "./view/def";

export interface IData {
    galaxy: IGalaxy;
    player: symbol;
}

export const enum ChannelKind {
    Galaxy,
    Tabs,
    SwitchTab,
    NameSearchUpdate,
}

export interface ISubscriber {
    update(state: Set<ChannelKind>): void;
}

const channelKindValues = [
    ChannelKind.Galaxy,
    ChannelKind.Tabs,
    ChannelKind.SwitchTab,
    ChannelKind.NameSearchUpdate,
];

export interface IGalaxyViewData {
    center: Vec2D;
    gridSize: number;
}

export const enum SearchKind {
    Planet,
    Star,
    Nation,
    Colony,
}

const DEFAULT_TABS: TabData[] = [
    {
        kind: TabKind.Galaxy,
        tabId: Symbol(),
    },
    {
        kind: TabKind.Player,
        tabId: Symbol(),
    },
    {
        kind: TabKind.Nation,
        tabId: Symbol(),
    },
    {
        kind: TabKind.Station,
        tabId: Symbol(),
    },
    {
        kind: TabKind.People,
        tabId: Symbol(),
    },
    {
        kind: TabKind.Search,
        tabId: Symbol(),
    },
];

export class Database {

    // somewhat-persistent temp data; handled by external views
    public readonly galaxyViewData: IGalaxyViewData = {
        center: [0, 0],
        gridSize: MIN_GRID_SIZE,
    };

    public curTabId!: symbol;

    private galaxyState!: IGalaxy;
    private tabState!: TabData[];
    private cacheSearchResult: Array<[symbol, SearchKind]> = [];
    private readonly subscribers = new Set<ISubscriber>();
    private readonly flags = new Set<ChannelKind>();
    private playerId1!: symbol;
    private searchNameId?: number;

    private dictionary = new Dictionary<symbol, SearchKind>();

    constructor(base: IData) {
        this.reset(base);
    }

    public reset(d: IData) {

        this.galaxyState = d.galaxy;
        this.playerId1 = d.player;

        const tabs = DEFAULT_TABS.slice();

        const galaxyTabId = tabs[0].tabId;
        this.curTabId = galaxyTabId;

        this.setTabsHelper(tabs);

        this.buildDict();
        this.cacheSearchResult = [];

        this.notify(...channelKindValues);
    }

    public buildDict() {
        const galaxy = this.galaxyState;
        [
            makePair(SearchKind.Planet, galaxy.planets),
            makePair(SearchKind.Star, galaxy.stars),
            makePair(SearchKind.Nation, galaxy.nations),
        ]
            .forEach(([nameKind, dataMap]) => {
                for (const [id, data] of dataMap) {
                    this.dictionary.set(data.name, id, nameKind);
                }
            });

        const colonies = new Map(Array
            .from(galaxy.colonyGovs.keys())
            .map((x) => makePair(x, SearchKind.Colony)));
        this.dictionary.batchSet("colony", colonies);
    }

    public set searchName(name: string) {
        clearInterval(this.searchNameId);
        this.searchNameId = setInterval(() => {
            this.cacheSearchResult = Array.from(this.dictionary.search(name));
            this.notify(ChannelKind.NameSearchUpdate);
            clearInterval(this.searchNameId);
        }, 300);
    }

    public get searchNameResult() {
        return this.cacheSearchResult;
    }

    public get tabId() {
        return this.curTabId;
    }

    public set tabId(tabId: symbol) {
        this.switchTabHelper(tabId);
        this.notify();
    }

    public set galaxy(g: IGalaxy) {
        console.assert(g !== null && g !== undefined);
        this.galaxyState = g;
        this.notify(ChannelKind.Galaxy);
    }

    public get galaxy() {
        return this.galaxyState;
    }

    public get playerId() {
        return this.playerId1;
    }

    public get tabs() {
        return this.tabState.slice();
    }

    public addPlanetTab(planetId: symbol) {
        const tabs = this.tabState;
        // perform linear search; add a new tab if the planet isn't listed in the tabs already
        const tab = tabs.find((x) =>
            x.kind === TabKind.Planet &&
            x.planetId === planetId);
        if (tab !== undefined) {
            return tab.tabId;
        }

        const tabId = Symbol();
        tabs.push({
            kind: TabKind.Planet,
            planetId,
            tabId,
        });
        this.setTabsHelper(tabs);
        return tabId;
    }

    public switchPlanetTab(planetId: symbol) {
        const tabId = this.addPlanetTab(planetId);
        this.switchTabHelper(tabId);
        this.notify();
    }

    public moveTabToFront(tabId: symbol) {

        const numBaseTabs = DEFAULT_TABS.length;

        const base = this.tabState.slice(0, numBaseTabs);

        if (base.some((x) => x.tabId === tabId)) {
            return;
        }

        const target = this.tabState.find((x) => x.tabId === tabId)!;
        console.assert(target !== undefined);
        const rest = this.tabState.slice(numBaseTabs).filter((x) => x.tabId !== tabId);
        this.tabState = [
            ...base,
            target,
            ...rest,
        ];

        const tabLimit = numBaseTabs + 10; // TODO
        const tabLen = this.tabState.length;
        if (tabLen > tabLimit) {
            console.assert(tabLen === tabLimit + 1);
            this.tabState.pop();
        }
    }

    public get data() {
        const ret: IData = {
            galaxy: this.galaxy,
            player: this.playerId,
        };
        return ret;
    }

    public tick() {
        this.galaxy = calNextState(this.galaxy);
    }

    public search(coor: Vec2D) {
        const db = this;
        const [x, y] = coor;
        const galaxy = db.galaxy;
        const locIdx = galaxy.cachedLocIdx;

        const coorFloored: Vec2D = [Math.floor(x), Math.floor(y)];
        const candidates = [coorFloored, ...neighbours(coorFloored)];
        console.assert(locIdx.size > 0);
        return makeSet(wrapIt(candidates)
            .map(([cx, cy]) => locIdx.get(calTrue2DHash(cx, cy))!) // turn hash to ids
            .filter((set) => set !== undefined)
            .flatMap((set) => set))
            .map((objId) => makePair(objId, getMass(galaxy, objId)))
            .filter(([objId, data]) => { // take objs that are in range
                const objLoc = galaxy.locs.get(objId)!;
                console.assert(objLoc !== undefined);
                return distance(objLoc, coor) <= data.radius;
            });
    }

    public runAi() {
        const galaxy = this.galaxyState;
        for (const [id, data] of galaxy.people) {
            if (id !== this.playerId) {
                performActions(this.galaxyState, id, data);
            }
        }
    }

    public addFlags(...flags: ChannelKind[]) {
        unionMut(this.flags, ...flags);
    }

    public notify(...flags: ChannelKind[]) {

        this.addFlags(...flags);

        for (const subscriber of this.subscribers) {
            subscriber.update(this.flags);
        }
        this.flags.clear();
    }

    public add(...observers: ISubscriber[]) {
        for (const subscriber of observers) {
            console.assert(!this.subscribers.has(subscriber), "double-subscribing the same subscriber");
            this.subscribers.add(subscriber);
        }
        this.notify(...channelKindValues);
    }

    public delete(subscriber: ISubscriber) {
        const isDeleted = this.subscribers.delete(subscriber);
        console.assert(isDeleted, "unsubscribing a non-exist subscriber");
        this.notify(...channelKindValues);
    }

    public clear() {
        this.subscribers.clear();
        this.notify(...channelKindValues);
    }

    private setTabsHelper(t: TabData[]) {
        console.assert(t !== null && t !== undefined);
        this.tabState = t.slice();
        this.addFlags(ChannelKind.Tabs);
    }

    private switchTabHelper(tabId: symbol) {
        const existed = this.tabState.some((x) => x.tabId === tabId);
        console.assert(existed);
        if (this.curTabId !== tabId) {
            this.curTabId = tabId;
            this.addFlags(ChannelKind.SwitchTab);
        }
    }
}

function neighbours([x, y]: Vec2D) {
    const ret: Vec2D[] = [
        [x, y - 1], // top
        [x, y + 1], // bottom
        [x - 1, y], // left
        [x + 1, y], // right,
        [x - 1, y - 1], // top-left
        [x + 1, y - 1], // top-right
        [x - 1, y + 1], // bottom-left
        [x + 1, y + 1], // bottom-right
    ];
    return ret;
}

function calLocIdx(galaxy: IGalaxy) {

    const ret = new Trie<Vec2D, Set<symbol>>();

    for (const [id, coor] of galaxy.locs) {
        const hash = calCoorHash(coor);
        const set = ret.getOrSet(hash, () => new Set());
        set.add(id);
    }

    return ret;
}

/*
        const galaxy = db.galaxy;
        const planet = getPlanet(galaxy, planetId);

        for (const [tileIdx, colonyId] of planet.polOwner) {
            const zoneId = planet.zones[tileIdx];
            const zone = galaxy.zones.get(zoneId)!;
            console.assert(zone !== undefined);
            const pop = zone.pop;

            const money = galaxy.account.get(zoneId) || 0;

            const demand = pop;

            for (const product of [
                Product.Food,
                Product.Drink,
                Product.Apparel,
                Product.Medicine,
            ]) {
                //
            }
        }
*/

/*
export function tryBuyZoneShare(galaxy: IGalaxy, zoneId: symbol, factionId: symbol, qty: number) {
    const zone = getZone(galaxy, zoneId)!;
    const shares = galaxy.zoneShare.get(zoneId);
    const sold = shares === undefined ? 0 : sum(...shares.values());
    const remain = zone.issuedShares - sold;
    console.assert(remain >= 0);

    const colony = getColony(galaxy, zone.colony);
    console.assert(galaxy.nations.has(colony.allegiance));

    const qtyToBuy = Math.min(remain, qty);

    const price = qtyToBuy;

    let nationalBank = galaxy.account.get(colony.allegiance);
    if (nationalBank === undefined) {
        nationalBank = new Map<symbol, number>();
        galaxy.account.set(colony.allegiance, nationalBank);
    }

    const balance = nationalBank.get(factionId) || 0;
    nationalBank.set(factionId, balance - price);
}
*/
