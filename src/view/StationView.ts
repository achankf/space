import { ChannelKind, Database, ISubscriber } from "../database";
import { clearChildren, setIfDiff } from "./helper";

const TEMPLATE = document.getElementById("stationView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class StationView
    extends HTMLElement
    implements ISubscriber {

    private name: HTMLElement;
    private tbody: HTMLElement;
    private updateHandler?: (flags: Set<ChannelKind>) => void;

    constructor(
        private db: Database,
    ) {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        this.tbody = shadowRoot.querySelector(".map") as HTMLElement;
        console.assert(this.tbody !== null);

        this.name = shadowRoot.querySelector(".name") as HTMLElement; console.assert(this.tbody !== null);

        this.layout();
    }

    public update(flags: Set<ChannelKind>) {
        if (this.updateHandler) {
            this.updateHandler(flags);
        }
    }

    private layout() {

        clearChildren(this.tbody);

        setIfDiff(this.name, "Station 1");

        const width = 2;
        const height = 1;

        const fragment = document.createDocumentFragment();

        for (let h = 0; h < height; h++) {
            const row = document.createElement("tr");
            fragment.appendChild(row);
            for (let w = 0; w < width; w++) {
                const data = document.createElement("td");
                row.appendChild(data);

                data.textContent = "A";
            }
        }
        this.tbody.appendChild(fragment);
    }
}

customElements.define("station-view", StationView);
