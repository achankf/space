import { ChannelKind, Database } from "../database";
import { allProducts, Product } from "../model/product";
import { batchChildren } from "./helper";

const TEMPLATE = document.getElementById("colonyView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class ColonyView extends HTMLFieldSetElement {

    constructor(private db: Database, public readonly colonyId: symbol) {
        super();
        this.appendChild(TEMPLATE.content.cloneNode(true));

        const colony = db.galaxy.colonyGovs.get(colonyId)!;
        console.assert(colony !== undefined);

        const marketTable = this.querySelector(".marketTable") as HTMLTableElement;
        console.assert(marketTable !== null);

        const row = this.querySelector(".marketRow") as HTMLTemplateElement;
        console.assert(row !== null);

        const frag = batchChildren(allProducts()
            .map((product) => {
                const clone = row.content.cloneNode(true) as HTMLTableRowElement;

                const type = clone.querySelector(".comType") as HTMLTableDataCellElement;
                console.assert(type !== null);
                type.textContent = Product[product];

                const demand = clone.querySelector(".comDemand") as HTMLTableDataCellElement;
                console.assert(type !== null);
                demand.textContent = String(0);

                const supply = clone.querySelector(".comSupply") as HTMLTableDataCellElement;
                console.assert(type !== null);
                supply.textContent = String(0);

                return clone;
            }));
        marketTable.appendChild(frag);

    }

    public update(flags: Set<ChannelKind>) {

        const galaxy = this.db.galaxy;
        const colonyId = this.colonyId;
        const colony = galaxy.colonyGovs.get(colonyId)!;
        console.assert(colony !== undefined);
    }
}

customElements.define("colony-view", ColonyView, { extends: "fieldset" });
