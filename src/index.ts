import { createGame } from "./createGame";
import { Database } from "./database";
import { Galaxy } from "./galaxy";
import { FactionKind } from "./model/def";
import { SwitchView } from "./view/SwitchView";

const g = Galaxy.new();
g.print_planets();

const root = document.body;
console.assert(root !== null);

function makeInitialState() {

    const galaxy = createGame();

    const player = Symbol();
    galaxy.people.set(player, {
        name: "Player",
    });

    const corp = Symbol();

    const issuedShare = 10000;
    galaxy.corps.set(corp, {
        issuedShare,
        kind: FactionKind.Corporate,
        name: "Company",
        opRights: new Set(),
    });

    galaxy.stock.set(corp, new Map([[player, issuedShare]]));

    return {
        galaxy,
        player,
    };
}

const db = new Database(makeInitialState());

const switchView = new SwitchView(db);

const breakpointButton = document.createElement("input");
breakpointButton.value = "Debugger";
breakpointButton.type = "button";
breakpointButton.onclick = () => {
    debugger;
};

const restartButton = document.createElement("input");
restartButton.value = "Restart";
restartButton.type = "button";
restartButton.onclick = () => {
    db.reset(makeInitialState());
};

const endTurnButton = document.createElement("input");
endTurnButton.value = "End Turn";
endTurnButton.type = "button";
endTurnButton.onclick = () => db.tick();

const restPanel = document.createElement("div");
restPanel.className = "restPanel";

// elements ordering

restPanel.appendChild(breakpointButton);
restPanel.appendChild(restartButton);
restPanel.appendChild(endTurnButton);

root.appendChild(switchView);
root.appendChild(restPanel);

// subsribe components and then start drawing

db.add(switchView);

// start the game
setInterval(() => db.tick(), 100); // update game world
setInterval(() => db.runAi(), 5000); // ai make decision
