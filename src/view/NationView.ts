import { ChannelKind, Database, ISubscriber } from "../database";

const TEMPLATE = document.getElementById("nationView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class NationView
    extends HTMLElement
    implements ISubscriber {

    constructor(private db: Database) {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    }

    public update(_: Set<ChannelKind>) {
        //
    }
}

customElements.define("nation-view", NationView);
