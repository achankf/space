import { ChannelKind, Database, ISubscriber } from "../database";
import { getPlanet } from "../model/getter";
import { fromIdx, toIdx } from "../model/map/idxCoor";
import { ColonyLobbyView } from "./ColonyLobbyView";
import { ColonyView } from "./ColonyView";
import { clearChildren, setIfDiff } from "./helper";

const TEMPLATE = document.getElementById("planetView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class PlanetView
    extends HTMLElement
    implements ISubscriber {

    private planetName: HTMLElement;
    private tbody: HTMLElement;
    private updateHandler?: (flags: Set<ChannelKind>) => void;
    private tile: HTMLElement;
    private polOwner: HTMLElement;
    private colonyViews = new Map<symbol, ColonyView>();
    private container: HTMLElement;
    private lobbyView?: ColonyLobbyView;
    private colonyView?: ColonyView;

    private tileId?: number;

    constructor(
        private db: Database,
        private planetId: symbol,
    ) {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        this.tbody = shadowRoot.querySelector(".map") as HTMLElement;
        console.assert(this.tbody !== null);

        this.planetName = shadowRoot.querySelector(".name") as HTMLElement; console.assert(this.tbody !== null);

        this.tile = shadowRoot.querySelector(".tile") as HTMLDivElement;
        console.assert(this.tile !== null);

        this.polOwner = shadowRoot.querySelector(".polOwner") as HTMLElement;
        console.assert(this.polOwner !== null);

        this.container = shadowRoot.querySelector(".container") as HTMLElement;
        console.assert(this.container !== null);

        this.layout();
    }

    public update(flags: Set<ChannelKind>) {

        const db = this.db;
        const galaxy = db.galaxy;
        const planet = getPlanet(galaxy, this.planetId);

        const colonyId = galaxy.planetColonyMap.get(this.planetId);

        if (colonyId !== undefined) {
            console.assert(galaxy.colonyGovs.has(colonyId));
            if (this.colonyView === undefined) {
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            } else if (colonyId !== this.colonyView.colonyId) {
                this.colonyView.remove();
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            }
            this.colonyView.update(flags);
        }

        for (const view of this.colonyViews.values()) {
            view.update(flags);
        }

        /*
        if (this.tileId !== undefined) {
            if (this.lobbyView === undefined || this.tileId !== this.lobbyView.locIdx) {
                const container = this.shadowRoot!.querySelector(".colonyLobbyViewContainer") as HTMLDivElement;
                console.assert(container !== null);

                if (this.lobbyView !== undefined) {
                    this.lobbyView.remove();
                }

                this.lobbyView = container.appendChild(new ColonyLobbyView(db, this.planetId, this.tileId));
            }
        }
        */

        if (this.updateHandler) {
            this.updateHandler(flags);
        }
    }

    private updateHelper() {
        const tileId = this.tileId;
        const planetId = this.planetId;
        if (tileId !== undefined) {
            const galaxy = this.db.galaxy;
            const planet = galaxy.planets.get(planetId)!;
            console.assert(planet !== undefined);

            const coor = fromIdx(planet, tileId);
            setIfDiff(this.tile, `${coor}`);

            const zoneId = planet.zones[tileId];
            const zone = galaxy.zones.get(zoneId)!;
            console.assert(zone !== undefined);

            const colonyId = galaxy.planetColonyMap.get(planetId);

            if (colonyId !== undefined) {
                const colony = galaxy.colonyGovs.get(colonyId)!;
                const nation = galaxy.nations.get(colony.allegiance)!;
                console.assert(colony !== undefined);
                setIfDiff(this.polOwner, nation.name);
            } else {
                setIfDiff(this.polOwner, "");
            }
        }
    }

    private layout() {

        clearChildren(this.tbody);

        const galaxy = this.db.galaxy;
        const planet = galaxy.planets.get(this.planetId)!;
        console.assert(planet !== undefined);

        setIfDiff(this.planetName, planet.name);

        const width = planet.width;
        const height = planet.height;

        const fragment = document.createDocumentFragment();

        for (let h = 0; h < height; h++) {
            const row = document.createElement("tr");
            fragment.appendChild(row);
            for (let w = 0; w < width; w++) {
                const data = document.createElement("td");
                row.appendChild(data);

                const idx = toIdx(planet, w, h);
                const zoneId = planet.zones[idx];
                const zone = galaxy.zones.get(zoneId)!;
                console.assert(zone !== undefined);
                /*
                if (colGov !== undefined) {
                    const r = (w * h) % 255;
                    const b = (w / h * 255) % 255;
                    data.style.backgroundColor = `rgb(${r},0,${b})`;
                }
                */
                data.textContent = "A";
                data.onclick = this.setHoverTileIdx(idx);
            }
        }
        this.tbody.appendChild(fragment);
    }

    private setHoverTileIdx = (idx: number) => () => {
        this.tileId = idx;
        this.updateHelper();
    }
}

customElements.define("planet-view", PlanetView);
