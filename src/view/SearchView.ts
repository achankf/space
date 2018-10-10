import { ChannelKind, Database, ISubscriber } from "../database";
import { IPlanetId } from "../model/def";
import { clearChildren } from "./helper";

const TEMPLATE = document.getElementById("searchView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

const RESULT_ITEM = document.getElementById("resultItem") as HTMLTemplateElement;
console.assert(RESULT_ITEM !== null);

export class SearchView
    extends HTMLElement
    implements ISubscriber {

    private readonly searchTerm: HTMLInputElement;
    private readonly searchResult: HTMLDivElement;

    constructor(private db: Database) {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        this.searchTerm = shadowRoot.querySelector(".searchTerm") as HTMLInputElement;
        console.assert(this.searchTerm !== null);
        this.searchTerm.onkeyup = this.handleKeyup;

        this.searchResult = shadowRoot.querySelector(".result") as HTMLDivElement;
        console.assert(this.searchResult !== null);

        this.refreshResults();
    }

    public update(flags: Set<ChannelKind>) {

        const db = this.db;

        if (flags.has(ChannelKind.NameSearchUpdate)) {
            this.refreshResults();
        }
    }

    private refreshResults() {

        clearChildren(this.searchResult);

        const db = this.db;
        const fragment = document.createDocumentFragment();

        for (const result of db.searchNameResult) {

            const inner = document.createDocumentFragment();
            inner.appendChild(RESULT_ITEM.content.cloneNode(true));

            const resultItem = inner.querySelector(".resultItem") as HTMLDivElement;
            console.assert(resultItem !== null);

            const nameField = inner.querySelector(".name") as
                HTMLDivElement;
            console.assert(nameField !== null);
            nameField.textContent = result.name;

            const id = result.id;
            if (id.Planet !== undefined) {
                const planetId = id as IPlanetId;
                resultItem.onclick = () => db.switchPlanetTab(planetId);
            } else if (id.Star !== undefined) {
                // TODO
            } else if (id.Nation !== undefined) {
                // TODO
            } else if (id.Corporation !== undefined) {
                // TODO
            } else {
                throw new Error("not handled");
            }
            fragment.appendChild(inner);
        }
        this.searchResult.appendChild(fragment);
    }

    private handleKeyup = () => {
        const db = this.db;
        const term = this.searchTerm.value;
        db.searchName = term;
    }
}

customElements.define("search-view", SearchView);
