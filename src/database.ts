import { unionMut, Vec2D } from "myalgo-ts";
import { Galaxy } from "../galaxy";
import { INameSearchResult, IPlanetId, ISearchResult } from "./model/def";
import { TabData, TabKind } from "./view/def";
import { IDrawGalaxyData } from "./view/def2";

export interface IData {
    galaxy: Galaxy;
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

export interface IViewData {
    diffFromOrigin: Vec2D; // note: a vector that specify how far away the camera is away from the origin; the center of the screen (in game coordinate) is origin - diffFromOrigin
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
    public readonly galaxyViewData: IViewData = {
        diffFromOrigin: [0, 0],
        gridSize: 0.01,
    };

    public curTabId!: symbol;
    public galaxy!: Galaxy;

    private tabState!: TabData[];
    private cacheSearchResult: INameSearchResult[] = [];
    private readonly subscribers = new Set<ISubscriber>();
    private readonly flags = new Set<ChannelKind>();
    private searchNameId?: number;

    constructor(base: IData) {
        this.reset(base);
    }

    public reset(d: IData) {

        this.galaxy = d.galaxy;

        const tabs = DEFAULT_TABS.slice();

        const galaxyTabId = tabs[0].tabId;
        this.curTabId = galaxyTabId;

        this.setTabsHelper(tabs);

        this.cacheSearchResult = [];

        this.notify(...channelKindValues);
    }

    public set searchName(name: string) {
        clearInterval(this.searchNameId);
        this.searchNameId = setInterval(() => {
            this.cacheSearchResult = this.galaxy.interop_search_name(name);
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

    public calDrawData([tlX, tlY]: Vec2D, [brX, brY]: Vec2D, gridSize: number): IDrawGalaxyData {
        return this.galaxy.interop_cal_draw_data(tlX, tlY, brX, brY, gridSize);
    }

    public getPlanetName(planetId: IPlanetId): string {
        return this.galaxy.get_planet_name(planetId.Planet);
    }

    /*
    public getPlanetInfo(planetId: IPlanetId): IPlanetInfo {
        return this.galaxy.interop_get_planet_info(planetId);
    }
    */

    /*
    public calColonyCivilianDemands(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_civilian_demands(colonyId);
    }

    public calSupply(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_supply(colonyId);
    }

    public calColonyCorpDemands(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_corporate_demands(colonyId);
    }
    */

    /*
    public createPlayer(name: string, job: Job): ISpecialist {
        return this.galaxy.interop_create_player(name, job);
    }
    */

    public search_exact(x: number, y: number) {
        const galaxy = this.galaxy;
        const results: ISearchResult | null = galaxy.interop_search_exact(x, y);

        if (!results) {
            return;
        }

        // results.id.City

        console.log(results);
    }

    public handleCoorSearch(x: number, y: number) {
        const galaxy = this.galaxy;
        console.log(galaxy.print_search(x, y));
        /*
        const results: ISearchResult[] = galaxy2.interop_search(x, y);

        console.log(results);

        const unwrapped = results.map((result): INameSearchResult => {
            const id = result.id;
            return { id, name: result.name };
        });

        switch (unwrapped.length) {
            case 0:
                break;
            case 1:
                const result = results[0];
                const id = result.id;
                if (id !== undefined) {
                    if (id.Planet !== undefined) {
                        const planetId = id as IPlanetId;
                        this.switchPlanetTab(planetId);
                    } else if (id.Star !== undefined) {
                        const data = unwrapped[0];
                        console.log(data.id.Star + " " + data.name);
                        // TODO ignore for now
                    } else if (id.City !== undefined) {
                        const data = unwrapped[0];
                        console.log(data.id.City + " " + data.name);
                        // TODO ignore for now
                    } else {
                        throw new Error("not handled");
                    }
                }
                break;
            default:
                this.cacheSearchResult = unwrapped;
                // TODO switch to the search tab
                break;
        }
        */
    }

    public get tabs() {
        return this.tabState.slice();
    }

    public getPlanetEdges(planetId: number) {
        return this.galaxy.get_planet_edges(planetId);
    }

    public getPlanetVerticesCoors(planetId: number) {
        return this.galaxy.get_planet_vertices_coors(planetId);
    }

    public addPlanetTab(planetId: IPlanetId) {
        const tabs = this.tabState;
        // perform linear search; add a new tab if the planet isn't listed in the tabs already
        const tab = tabs.find((x) =>
            x.kind === TabKind.Planet &&
            x.planetId.Planet === planetId.Planet);
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

    public switchPlanetTab(planetId: IPlanetId) {
        console.log("switching view to planet id:", planetId);
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
        };
        return ret;
    }

    public tick() {
        this.galaxy.cal_next_state();
        this.notify(ChannelKind.Galaxy);
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
