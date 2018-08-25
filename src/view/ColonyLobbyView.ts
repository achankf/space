import { ChannelKind, Database, ISubscriber } from "../database";
import { getPlanet } from "../model/getter";

const TEMPLATE = document.getElementById("colonyLobbyView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class ColonyLobbyView
    extends HTMLElement
    implements ISubscriber {

    constructor(
        private db: Database,
        public readonly planetId: symbol,
        public readonly locIdx: number,
    ) {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        const claimZoneColony = shadowRoot.querySelector(".claimZoneColony") as HTMLSelectElement;
        console.assert(claimZoneColony !== null);

        const galaxy = db.galaxy;
        const planet = getPlanet(galaxy, planetId);
        if (planet.zones[locIdx] !== undefined) {

            /*
            for (const colonyId of planet.colonies) {
                const option = claimZoneColony.appendChild(document.createElement("option"));
                const colony = galaxy.colonies.get(colonyId)!;
                console.assert(colony !== undefined);
                option.textContent = colony.name;
            }
            */
        }
    }

    public update(_: Set<ChannelKind>) {
        //
    }
}

customElements.define("colony-lobby-view", ColonyLobbyView);
