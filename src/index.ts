import { calNextState, createInitialState, Game } from "./model/game";
import { createEastVsWestMap } from "./model/map/eastVsWest";
import { Subject } from "./observer";
import { IViewData, MapView } from "./view/map";

const element = document.getElementById("app")!;
console.assert(element !== null);

const mapGen = () => createEastVsWestMap(50, 40);
const map = mapGen();
const gameSubject = new Subject<Game>(createInitialState(map));
const viewDataSubject = new Subject<IViewData>({});

const canvas = new MapView(gameSubject, viewDataSubject);
gameSubject.add(canvas);
element.appendChild(canvas.element);

gameSubject.nextState = calNextState(gameSubject.prevState);
/*
setInterval(() => {
    gameSubject.nextState = calNextState(gameSubject.prevState);
}, 33);
*/

const textarea = document.createElement("textarea");
textarea.value = `var a 
= astar(graph,weightFn,0, 10);
console.log(a);`;
const button = document.createElement("input");
button.value = "Run";
button.type = "button";
button.onclick = () => {
    eval(textarea.value);
}
element.appendChild(textarea);
element.appendChild(button);

const button2 = document.createElement("input");
button2.value = "Restart";
button2.type = "button";
button2.onclick = () => {
    // clear UI data first, order is important
    viewDataSubject.nextState = {};
    gameSubject.nextState = createInitialState(mapGen());
}
element.appendChild(button2);

const button3 = document.createElement("input");
button3.value = "End Turn";
button3.type = "button";
button3.onclick = () => {
    gameSubject.nextState = calNextState(gameSubject.prevState);
}
element.appendChild(button3);

canvas.startRenderLoop();