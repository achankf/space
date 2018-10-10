import { ChannelKind, Database, ISubscriber } from "../database";
import { IGalaxyTab, INationTab, IPeopleTab, IPlanetTab, IPlayerTab, ISearchTab, IStationTab, TabData, TabKind } from "./def";
import { GalaxyView } from "./GalaxyView";
import { clearChildren } from "./helper";
import { NationView } from "./NationView";
import { PeopleView } from "./PeopleView";
import { PlanetView } from "./PlanetView";
import { PlayerView } from "./PlayerView";
import { SearchView } from "./SearchView";
import { StationView } from "./StationView";

const TEMPLATE = document.getElementById("switchView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

interface IGalaxyView extends IGalaxyTab {
    view: GalaxyView;
}

interface ISearchView extends ISearchTab {
    view: SearchView;
}

interface IPlanetView extends IPlanetTab {
    view: PlanetView;
}

interface IPlayerView extends IPlayerTab {
    view: PlayerView;
}

interface INationView extends INationTab {
    view: NationView;
}

interface IStationView extends IStationTab {
    view: StationView;
}

interface IPeopleView extends IPeopleTab {
    view: PeopleView;
}

type CurrentView =
    IGalaxyView |
    IPlanetView |
    ISearchView |
    IPlayerView |
    INationView |
    IStationView |
    IPeopleView
    ;

export class SwitchView
    extends HTMLElement
    implements ISubscriber {

    private curView!: CurrentView;
    private tabs: Element;
    private tabChildren = new Map<symbol, HTMLDivElement>();
    private container: Element;

    constructor(private db: Database) {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        this.tabs = shadowRoot.querySelector(".tabs")!;
        console.assert(this.tabs !== null);

        this.container = shadowRoot.querySelector(".container")!;
        console.assert(this.container !== null);

        const tabData = db.tabs[0];
        console.assert(tabData.kind === TabKind.Galaxy);

        this.switch(tabData);
    }

    public update(flags: Set<ChannelKind>) {

        if (flags.has(ChannelKind.Tabs)) {
            this.updateTabs();
        }

        if (flags.has(ChannelKind.SwitchTab)) {
            const db = this.db;
            if (db.tabId !== this.curView.tabId) {
                const tabData = db.tabs.find((x) => x.tabId === db.tabId)!;
                console.assert(tabData !== undefined);
                this.switch(tabData);
            }
        }

        this.curView.view.update(flags);
    }

    public updateTabs() {

        const db = this.db;

        clearChildren(this.tabs);
        const oldTabChildren = this.tabChildren;
        this.tabChildren = new Map();
        for (const data of this.db.tabs) {

            // try to get or create the tab
            let tab = oldTabChildren.get(data.tabId);
            if (tab) {
                this.tabChildren.set(data.tabId, tab);
            } else {
                tab = document.createElement("div");
                tab.onclick = () => this.db.tabId = data.tabId;

                switch (data.kind) {
                    case TabKind.Galaxy:
                        tab.textContent = "Galaxy";
                        break;
                    case TabKind.Planet:
                        {
                            const planetName = db.getPlanetName(data.planetId);
                            tab.textContent = planetName;
                        }
                        break;
                    case TabKind.Search:
                        tab.textContent = "Search";
                        break;
                    case TabKind.Player:
                        tab.textContent = "Player";
                        break;
                    case TabKind.Nation:
                        tab.textContent = "Nation";
                        break;
                    case TabKind.Station:
                        tab.textContent = "Station";
                        break;
                    case TabKind.People:
                        tab.textContent = "People";
                        break;
                    default:
                        throw new Error("not handled");
                }
                this.tabChildren.set(data.tabId, tab);
            }
            this.tabs.appendChild(tab);
        }
    }

    private switchHelper(view: CurrentView) {
        clearChildren(this.container);
        this.curView = view;
        this.container.appendChild(view.view);
    }

    private createGalaxyView(): IGalaxyView {
        const db = this.db;
        console.assert(db.tabs.length > 0 && db.tabs[0].kind === TabKind.Galaxy);
        const tabId = db.tabs[0].tabId;
        return {
            kind: TabKind.Galaxy,
            tabId,
            view: new GalaxyView(this.db),
        };
    }

    private switch = (data: TabData) => {

        const db = this.db;

        if (this.curView === undefined) {
            this.switchHelper(this.createGalaxyView());
        } else {
            switch (data.kind) {
                case TabKind.Galaxy:
                    if (this.curView.kind !== data.kind) {
                        this.switchHelper(this.createGalaxyView());
                    }
                    break;
                case TabKind.Planet:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Planet:
                            if (this.curView.planetId === data.planetId) {
                                return; // no need to switch
                            }
                            break;
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                    }

                    this.switchHelper({
                        ...data,
                        view: new PlanetView(db, data.planetId.Planet),
                    });
                    break;
                case TabKind.Search:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                        case TabKind.Search:
                            return; // no need to switch
                    }

                    this.switchHelper({
                        ...data,
                        view: new SearchView(db),
                    });
                    break;
                case TabKind.Player:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                        case TabKind.Player:
                            return; // no need to switch
                    }

                    this.switchHelper({
                        ...data,
                        view: new PlayerView(db),
                    });
                    break;
                case TabKind.Nation:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                        case TabKind.Nation:
                            return; // no need to switch
                    }

                    this.switchHelper({
                        ...data,
                        view: new NationView(db),
                    });
                    break;
                case TabKind.Station:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                        case TabKind.Station:
                            return; // no need to switch
                    }

                    this.switchHelper({
                        ...data,
                        view: new StationView(db),
                    });
                    break;
                case TabKind.People:

                    // cleanup
                    switch (this.curView.kind) {
                        case TabKind.Galaxy:
                            this.curView.view.suspend();
                            break;
                        case TabKind.People:
                            return; // no need to switch
                    }

                    this.switchHelper({
                        ...data,
                        view: new PeopleView(db),
                    });
                    break;
                default:
                    throw new Error("not handled");
            }
        }

        db.moveTabToFront(data.tabId);
        this.updateTabs();

        const curTabId = db.tabId;
        for (const [tabId, element] of this.tabChildren) {
            if (tabId === curTabId) {
                element.classList.add("selected");
            } else {
                element.classList.remove("selected");
            }
        }
    }
}

customElements.define("switch-view", SwitchView);
