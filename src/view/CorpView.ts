import { Database } from "../database";

const TEMPLATE = document.getElementById("corpView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class CorpView extends HTMLElement {

    private nameDiv: Element;

    constructor(private db: Database, corpId: symbol) {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this.nameDiv = shadowRoot.querySelector("name")!;
        console.assert(this.nameDiv !== null);

        /*
        const corp = db.galaxy.corps.get(corpId)!;
        console.assert(corp !== undefined);
        this.nameDiv.textContent = corp.name;
        */
    }
}

customElements.define("corp-view", CorpView);
