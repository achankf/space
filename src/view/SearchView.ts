import { ChannelKind, Database, ISubscriber, SearchKind } from "../database";
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
        const galaxy = db.galaxy;
        const fragment = document.createDocumentFragment();

        for (const [id, nameKind] of db.searchNameResult) {

            const inner = document.createDocumentFragment();
            inner.appendChild(RESULT_ITEM.content.cloneNode(true));

            const resultItem = inner.querySelector(".resultItem") as HTMLDivElement;
            console.assert(resultItem !== null);

            const nameField = inner.querySelector(".name") as
                HTMLDivElement;
            console.assert(nameField !== null);

            switch (nameKind) {
                case SearchKind.Planet:
                    {
                        const planet = galaxy.planets.get(id);
                        if (planet === undefined) {
                            continue;
                        }
                        resultItem.onclick = () => {
                            db.switchPlanetTab(id);
                        };

                        nameField.textContent = planet.name;
                    }
                    break;
                case SearchKind.Star:
                    {
                        const star = galaxy.stars.get(id);
                        if (star === undefined) {
                            continue;
                        }

                        nameField.textContent = star.name;
                    }
                    break;
                case SearchKind.Nation:
                    {
                        const nation = galaxy.nations.get(id);
                        if (nation === undefined) {
                            continue;
                        }

                        nameField.textContent = nation.name;
                    }
                    break;
                case SearchKind.Colony:
                    {
                        const colony = galaxy.colonyGovs.get(id);
                        if (colony === undefined) {
                            continue;
                        }
                        const locatedSrc = colony.locatedSrc;
                        const planet = galaxy.planets.get(locatedSrc)!;
                        console.assert(planet !== undefined);
                        resultItem.onclick = () => {
                            db.switchPlanetTab(locatedSrc);
                        };
                        nameField.textContent = `Colony, ${planet.name}`;
                    }
                    break;
                default:
                    throw new Error("not handled");
            }
            fragment.appendChild(inner);
        }
        this.searchResult.appendChild(fragment);
    }

    private handleKeyup = () => {
        const db = this.db;
        const term = this.searchTerm.value;
        console.log(term);
        db.searchName = term;
    }
}

customElements.define("search-view", SearchView);
