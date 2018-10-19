import { bootstrap, CombatStyle, Galaxy } from "../galaxy";
import { Database, IData, ISubscriber } from "./database";
import { TICK_PERIOD } from "./model/def";
import { SwitchView } from "./view/SwitchView";

const root = document.body;
console.assert(root !== null);

function makeInitialState(): Database {

    const data: IData = {
        galaxy: Galaxy.new(),
    };

    const ret = new Database(data);
    //   ret.createPlayer("Player", Job.CEO);

    return ret;
}

{
    bootstrap();

    const db = makeInitialState();

    db.galaxy.add_division_template(2, 0, 0, CombatStyle.Push, false);
    const template = db.galaxy.get_division_template(0);
    console.log(template);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);

    const switchView = new SwitchView(db);

    const breakpointButton = document.createElement("input");
    breakpointButton.value = "Debugger";
    breakpointButton.type = "button";
    breakpointButton.onclick = () => {
        debugger;
    };

    const endTurnButton = document.createElement("input");
    endTurnButton.value = "End Turn";
    endTurnButton.type = "button";
    endTurnButton.onclick = () => db.tick();

    const restPanel = document.createElement("div");
    restPanel.className = "restPanel";

    const testPanel = document.createElement("div");
    testPanel.style.display = "flex";
    const planetDim = document.createElement("div");

    const observers: Array<() => void> = [];
    /*
    const [width, height] = db.galaxy.get_planet_tile_dimension();
    planetDim.textContent = `width:${width}, height:${height}`;
    const colonyLabel = document.createElement("div");
    const tileTable = document.createElement("table");
    tileTable.style.borderCollapse = "collapse";

    const privateMoneyLabel = document.createElement("div");
    const publicMoneyLabel = document.createElement("div");

    const industryLabel = document.createElement("div");

    const productTable = document.createElement("table");
    productTable.style.borderCollapse = "collapse";

    const colonySet = document.createElement("fieldset");
    const colonyLegend = document.createElement("legend");
    colonyLegend.textContent = "Colony";

    colonySet.appendChild(colonyLegend);
    colonySet.appendChild(colonyLabel);
    colonySet.appendChild(publicMoneyLabel);
    colonySet.appendChild(privateMoneyLabel);
    colonySet.appendChild(planetDim);
    colonySet.appendChild(industryLabel);
    colonySet.appendChild(productTable);

    testPanel.appendChild(colonySet);
    testPanel.appendChild(tileTable);

    const select = testPanel.appendChild(document.createElement("select"));
    select.multiple = true;
    select.onchange = () => {
        const selected = [];
        for (const option of select.options) {
            if (option.selected) {
                selected.push(option.value);
            }
        }

        console.table(selected.map((idx) => {
            const army = db.galaxy.get_army(Number(idx));
            const obj = {
                exoskeleton: army.exoskeleton,
                rifle: army.rifle,
                saber: army.saber,
                troops: army.troops,
                uniform: army.uniform,
            };
            list.push({
                idx, obj,
            });
            army.free();
            return ({ idx, army });
        }));
    };

    const neighbourColonies = testPanel.appendChild(new NeighbourColoniesView(db));

    observers.push(() => {
        neighbourColonies.update();
    });

    observers.push(() => {
        const numArmies = db.galaxy.get_armies_len();
        if (numArmies > select.children.length) {
            const start = select.children.length;
            const diff = numArmies - select.children.length;
            for (let i = 0; i < diff; i++) {
                const id = i + start;
                const option1 = select.appendChild(document.createElement("option"));
                option1.textContent = `Army ${id}`;
                option1.value = id.toString();
            }
        } else if (numArmies < select.children.length) {
            const diff = select.children.length - numArmies;
            for (let i = 0; i < diff; i++) {
                select.lastElementChild!.remove();
            }
        }
    });

    {
        // initial test data
        //  const galaxy = db.galaxy;
        //  const [x, y] = [3, 5];
        //  galaxy.mark_controlled_tile(x, y, true);
        // galaxy.add_industries(x, y, 21, 20);
    }

    {

        observers.push(() => {
            //
            const colony = db.galaxy.get_colony();
            setIfDiff(publicMoneyLabel, `public money: ${colony.public_money}`);
            setIfDiff(privateMoneyLabel, `private money: ${colony.private_money}`);
            colony.free();
        });

        observers.push(() => { colonyLabel.textContent = db.galaxy.print_dev(); });

        observers.push(() => {
            const availableIndustry = db.galaxy.cal_colony_industry();
            const usedIndustry = db.galaxy.cal_colony_used_industry();
            setIfDiff(industryLabel, `# factories: ${availableIndustry} (${usedIndustry} used)`);
        });

        {
            const fragRows = document.createDocumentFragment();
            for (let y = 0; y < height; y++) {
                const row = fragRows.appendChild(document.createElement("tr"));
                for (let x = 0; x < width; x++) {
                    const data = row.appendChild(document.createElement("td"));
                    data.style.border = "1px solid black";

                    observers.push(() => {
                        if (db.galaxy.is_tile_controlled(x, y)) {
                            data.style.background = "yellow";
                        } else if (db.galaxy.is_tile_controlled_by_others(x, y)) {
                            data.style.background = "orange";
                        } else {
                            data.style.background = null;
                        }
                    });

                    observers.push(() => {
                        const tile = db.galaxy.get_tile_at(x, y);
                        const garrison = db.galaxy.get_garrison(x, y);

                        const text = `K:${tile.kind}, F:${tile.factories}, G:${garrison}`;

                        tile.free();

                        setIfDiff(data, text);
                    });

                    data.onclick = () => {
                        db.galaxy.add_industries(x, y, 1);
                    };
                }
            }

            tileTable.appendChild(fragRows);
        }

        {
            const fragRows = document.createDocumentFragment();

            {
                const header = fragRows.appendChild(document.createElement("tr"));
                header.appendChild(document.createElement("td")).textContent = "Product";

                header.appendChild(document.createElement("td")).textContent = "Capacity";

                header.appendChild(document.createElement("td")).textContent = "Qty";
            }

            for (const product of allProducts()) {
                const row = fragRows.appendChild(document.createElement("tr"));
                const productName = row.appendChild(document.createElement("td"));
                const productionCapacity = row.appendChild(document.createElement("td"));
                const qty = row.appendChild(document.createElement("td"));
                const change = row.appendChild(document.createElement("td"));

                const addButton = change.appendChild(document.createElement("button"));
                addButton.textContent = "+";
                addButton.onclick = () => {
                    db.galaxy.add_industry(product);
                };

                const removeButton = change.appendChild(document.createElement("button"));
                removeButton.textContent = "-"; removeButton.onclick = () => {
                    db.galaxy.remove_industry(product);
                };

                observers.push(() => {
                    const galaxy = db.galaxy;
                    const availableIndustry = galaxy.cal_colony_industry();
                    const usedIndustry = galaxy.cal_colony_used_industry();
                    addButton.disabled = availableIndustry === usedIndustry;

                    const products = galaxy.get_colony_storage(product);
                    removeButton.disabled = products.production_capacity === 0;
                    products.free();
                });

                productName.textContent = getProductName(product);

                observers.push(() => {
                    const productData = db.galaxy.get_colony_storage(product);
                    setIfDiff(productionCapacity, productData.production_capacity.toString());
                    setIfDiff(qty, productData.qty.toString());

                    productData.free();
                });
            }
            productTable.appendChild(fragRows);
        }
    }
    */

    const test: ISubscriber = {
        update() {
            for (const observer of observers) {
                observer();
            }
        },
    };

    // elements ordering

    restPanel.appendChild(breakpointButton);
    restPanel.appendChild(endTurnButton);

    //  root.appendChild(testPanel);
    root.appendChild(switchView);
    root.appendChild(restPanel);

    // subsribe components and then start drawing

    db.add(test, switchView);

    // start the game
    setInterval(() => db.tick(), TICK_PERIOD); // update game world
}
