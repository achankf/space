import { ChannelKind, Database } from "../database";
import { IColonyId } from "../model/def";

const TEMPLATE = document.getElementById("colonyView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

export class ColonyView extends HTMLFieldSetElement {

    constructor(private db: Database, public readonly colonyId: IColonyId) {
        super();
        this.appendChild(TEMPLATE.content.cloneNode(true));

        const marketTable = this.querySelector(".marketTable") as HTMLTableElement;
        console.assert(marketTable !== null);

        const row = this.querySelector(".marketRow") as HTMLTemplateElement;
        console.assert(row !== null);

        /*
        const civDemands = db.calColonyCivilianDemands(colonyId);
        const marketSupply = db.calSupply(colonyId);

        const frag = batchChildren(allProducts()
            .map((product) => {
                const clone = row.content.cloneNode(true) as HTMLTableRowElement;

                const type = clone.querySelector(".comType") as HTMLTableDataCellElement;
                console.assert(type !== null);
                setIfDiff(type, getProductName(product));

                const demand = clone.querySelector(".comDemand") as HTMLTableDataCellElement;
                console.assert(demand !== null);
                setIfDiff(demand, String(civDemands[product]));

                const supply = clone.querySelector(".comSupply") as HTMLTableDataCellElement;
                console.assert(supply !== null);
                setIfDiff(supply, String(marketSupply[product]));

                return clone;
            }));
        marketTable.appendChild(frag);
        */

    }

    public update(flags: Set<ChannelKind>) {
        //
    }
}

customElements.define("colony-view", ColonyView, { extends: "fieldset" });
