import { Database } from "../database";

const ID = "id";
const RELATION = "relation";
const POWER = "power";
const THEIR_FRONT = "their";
const OUR_FRONT = "our";
const FRONT_SIZE = "front-size";

export class NeighbourColoniesView extends HTMLTableElement {

    private static createRow() {
        const row = document.createElement("tr");

        const id = row.appendChild(document.createElement("td"));
        id.className = ID;

        const relation = row.appendChild(document.createElement("td"));
        relation.className = RELATION;

        const power = row.appendChild(document.createElement("td"));
        power.className = POWER;

        const frontSize = row.appendChild(document.createElement("td"));
        frontSize.className = FRONT_SIZE;

        const theirFront = row.appendChild(document.createElement("td"));
        theirFront.className = THEIR_FRONT;

        const ourFront = row.appendChild(document.createElement("td"));
        ourFront.className = OUR_FRONT;

        return row;
    }

    private body = document.createElement("tbody");

    constructor(private readonly db: Database) {
        super();

        const fragment = document.createDocumentFragment();

        fragment.appendChild(document.createElement("caption")).textContent = "Neighbour Nations";

        const header = fragment.appendChild(document.createElement("thead"));

        const row1 = header.appendChild(document.createElement("tr"));
        const row2 = header.appendChild(document.createElement("tr"));

        row1.appendChild(document.createElement("th"));
        row1.appendChild(document.createElement("th"));
        row1.appendChild(document.createElement("th"));

        const frontline = row1.appendChild(document.createElement("th"));
        frontline.colSpan = 3;
        frontline.textContent = "Frontline";

        row2.appendChild(document.createElement("th")).textContent = "Nation Id";
        row2.appendChild(document.createElement("th")).textContent = "Relation";
        row2.appendChild(document.createElement("th")).textContent = "Power";
        row2.appendChild(document.createElement("th")).textContent = "Shared Borders";
        row2.appendChild(document.createElement("th")).textContent = "Their";
        row2.appendChild(document.createElement("th")).textContent = "Our";

        fragment.appendChild(this.body);

        this.appendChild(fragment);
    }

    public update() {
        /*
        const db = this.db;
        const neighbours = db.galaxy.interop_search_neighbour_countries();
        const neighbourIds = neighbours.get_nation_ids();
        const body = this.body;

        // update structure
        const count = body.childElementCount;
        if (neighbourIds.length > count) {
            body.appendChild(NeighbourColoniesView.createRow());
        } else if (neighbourIds.length < count) {
            const diff = count - neighbourIds.length;
            for (let i = 0; i < diff; i++) {
                body.lastElementChild!.remove();
            }
        }

        // update data
        body.childNodes.forEach((node, i) => {
            const row = node as HTMLTableRowElement;

            const idData = row.getElementsByClassName(ID)[0];
            const relationData = row.getElementsByClassName(RELATION)[0];
            const powerData = row.getElementsByClassName(POWER)[0];
            const theirData = row.getElementsByClassName(THEIR_FRONT)[0];
            const ourData = row.getElementsByClassName(OUR_FRONT)[0];
            const frontSizeData = row.getElementsByClassName(FRONT_SIZE)[0];

            const neighbourId = neighbourIds[i];
            const power = 623;

            const relation = db.galaxy.get_nation_relation(neighbourId);

            const frontSize = neighbours.get_num_border_tiles(neighbourId);

            setIfDiff(idData, neighbourId);
            setIfDiff(relationData, relation);
            setIfDiff(powerData, power);
            setIfDiff(frontSizeData, frontSize);
            setIfDiff(theirData, power);
            setIfDiff(ourData, power);
        });
        neighbours.free();
        */
    }
}

customElements.define("neighbour-colonies", NeighbourColoniesView, { extends: "table" });
