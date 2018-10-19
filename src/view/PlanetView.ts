import { subtract, Vec2D } from "myalgo-ts";
import { Galaxy } from "../../galaxy";
import { ChannelKind, Database, ISubscriber, IViewData } from "../database";
import { CanvasOperator } from "./CanvasOperator";
import { ColonyView } from "./ColonyView";
import { TWO_PI } from "./def";
import { clearChildren } from "./helper";

const TEMPLATE = document.getElementById("planetView") as HTMLTemplateElement;
console.assert(TEMPLATE !== null);

function getColor(nationId: number) {
    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    const modulus = Math.pow(2, 31);
    const a = 1103515245;
    const c = 12345;
    const mix = (a * nationId + c) % modulus;

    // https://stackoverflow.com/a/1152054
    return "#" + (0x1000000 + mix * 0xffffff).toString(16).substr(1, 6);
}

export class PlanetView
    extends HTMLElement
    implements ISubscriber {

    public static readonly cityRadiusLimit = Galaxy.get_city_radius_limit();

    public readonly planetViewData: IViewData = {
        diffFromOrigin: [0, 0],
        gridSize: 1,
    };

    private updatePanAnimation?: () => boolean;
    private planetName: HTMLElement;
    private canvas: HTMLCanvasElement;
    private tile: HTMLElement;
    private polOwner: HTMLElement;
    private container: HTMLElement;
    private colonyView?: ColonyView;
    private ctx: CanvasRenderingContext2D;
    private operator: CanvasOperator;
    private shouldRedrawView = true;

    private tileId?: number;

    constructor(
        private db: Database,
        public readonly planetId: number,
    ) {
        super();

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

        this.canvas = shadowRoot.querySelector(".map") as HTMLCanvasElement;
        console.assert(this.canvas !== null);

        this.ctx = this.canvas.getContext("2d")!;
        this.operator = new CanvasOperator(this.canvas, this.planetViewData);

        this.planetName = shadowRoot.querySelector(".name") as HTMLElement; console.assert(this.canvas !== null);

        this.tile = shadowRoot.querySelector(".tile") as HTMLDivElement;
        console.assert(this.tile !== null);

        this.polOwner = shadowRoot.querySelector(".polOwner") as HTMLElement;
        console.assert(this.polOwner !== null);

        this.container = shadowRoot.querySelector(".container") as HTMLElement;
        console.assert(this.container !== null);

        const gesture = new Hammer.Manager(this.canvas);
        const double = new Hammer.Tap({ event: "doubletap", taps: 2 });
        const single = new Hammer.Tap({ event: "singletap" });
        const pan = new Hammer.Pan().set({ direction: Hammer.DIRECTION_ALL });
        gesture.add([
            double,
            single,
            pan,
        ]);
        double.recognizeWith(single);
        single.requireFailure(double);

        // setup events
        gesture.on("singletap", this.singleClick);
        gesture.on("doubletap", this.doubleClick);
        gesture.on("pan", this.pan);

        this.canvas.addEventListener("wheel", this.wheel);

        this.layout();
        this.draw();
    }

    public update(flags: Set<ChannelKind>) {

        this.shouldRedrawView = true;
    }

    private doubleClick = (e: HammerInput) => {
        const vpOffset = this.operator.getOffsetFromCenter(e);
        this.panTo(vpOffset);
    }

    private singleClick = (e: HammerInput) => {
        const vpOffset = this.operator.getOffsetFromTopLeft(e);
        const [x, y] = this.operator.toGameCoor(vpOffset);

        // TODO
        const str = this.db.galaxy.cal_planet_click(this.planetId, x, y);

        console.log(str + " " + x + " " + y);
    }

    private resizeCanvas = () => {
        const canvas = this.canvas;

        const width = 400;
        const height = 400;

        this.canvas.style.height = height.toString();
        this.canvas.style.width = width.toString();

        if (canvas.width !== width ||
            canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            this.shouldRedrawView = true;
        }
    }

    private draw = () => {

        this.resizeCanvas();

        if (this.updatePanAnimation) {
            if (this.updatePanAnimation()) {
                this.updatePanAnimation = undefined;
            }
            this.shouldRedrawView = true;
        }

        if (this.shouldRedrawView) {

            // note: need to copy the data because memory may invalidate upon calling (any wasm object's) free()
            const points = this.db.getPlanetVerticesCoors(this.planetId);
            const points2 = [];
            for (let i = 0; i < points.length; i += 2) {
                const x = points[i];
                const y = points[i + 1];
                const gameCoor: Vec2D = [x, y];
                const vpCoor = this.operator.toVpCoor(gameCoor);
                points2.push({ gameCoor, vpCoor });
            }

            const colonized = this.getColonizedMap();

            this.drawMap(points2, colonized);
        }

        this.shouldRedrawView = false;
        requestAnimationFrame(this.draw);
    }

    private drawMap = (points: Array<{ gameCoor: Vec2D, vpCoor: Vec2D }>, colonized: Int32Array) => {

        const ctx = this.ctx;
        const db = this.db;
        const galaxy = db.galaxy;
        const normalizedCityRadiusLimit = PlanetView.cityRadiusLimit * this.planetViewData.gridSize;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw detailed cities, if zoomed enough
        points.forEach(({ gameCoor: [cityX, cityY], vpCoor: vpCity }, vertexIdx) => {
            if (colonized[vertexIdx] < 0) {
                return;
            }

            if (!this.operator.isCircleInView(vpCity, normalizedCityRadiusLimit)) {
                return;
            }

            const baseStructureSize = normalizedCityRadiusLimit / 50;

            // draw fancy detailed city (when zoomed enough)
            if (baseStructureSize >= 1) {

                const graph = this.db.galaxy.cal_city_graph(this.planetId, vertexIdx);
                const numStructures = graph.num_structures;

                if (numStructures > 0) {
                    const detailCityPoints = graph.get_points();
                    const dims = graph.get_dims();
                    const roads = graph.get_roads(); // n-1 edges in a tree with n vertices

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.fillStyle = "black";
                    ctx.lineWidth = 1;
                    for (let j = 0; j < roads.length; j += 2) {
                        console.assert(roads[j] !== roads[j + 1]);
                        const uIdx = 2 * roads[j];
                        const vIdx = 2 * roads[j + 1];
                        console.assert(uIdx !== vIdx);
                        const x0 = detailCityPoints[uIdx];
                        const y0 = detailCityPoints[uIdx + 1];
                        const x1 = detailCityPoints[vIdx];
                        const y1 = detailCityPoints[vIdx + 1];
                        console.assert(Number.isFinite(x0));
                        console.assert(Number.isFinite(x1));
                        console.assert(Number.isFinite(y0));
                        console.assert(Number.isFinite(y1));
                        console.assert(x0 !== x1 && y0 !== y1);

                        const [vpX0, vpY0] = this.operator.toVpCoor([cityX + x0, cityY + y0]);
                        const [vpX1, vpY1] = this.operator.toVpCoor([cityX + x1, cityY + y1]);

                        if ((vpX0 === vpX1 && vpY0 === vpY1)) {  // segment too short
                            continue;
                        }
                        ctx.moveTo(vpX0, vpY0);
                        ctx.lineTo(vpX1, vpY1);
                    }
                    ctx.stroke();

                    for (let j = 0; j < detailCityPoints.length; j += 2) {
                        const x = detailCityPoints[j];
                        const y = detailCityPoints[j + 1];
                        const w = Math.max(1, dims[j] * baseStructureSize);
                        const h = Math.max(1, dims[j + 1] * baseStructureSize);

                        const [vpX, vpY] = this.operator.toVpCoor([cityX + x, cityY + y]);

                        if (!this.operator.isRectInView([vpX, vpY], w, h)) {
                            continue;
                        }

                        ctx.rect(vpX, vpY, w, h);
                    }
                    ctx.fill();
                    ctx.restore();
                }

                graph.free();
            }
        });

        ctx.save();

        // edges
        const edges = db.getPlanetEdges(this.planetId);
        ctx.save();
        {
            ctx.beginPath();
            ctx.strokeStyle = "gray";
            ctx.fillStyle = "white";
            ctx.lineWidth = 2;
            for (let i = 0; i < edges.length; i += 2) {
                const idx0 = edges[i];
                const idx1 = edges[i + 1];
                const [vpX0, vpY0] = points[idx0].vpCoor;
                const [vpX1, vpY1] = points[idx1].vpCoor;

                ctx.moveTo(vpX0, vpY0);
                ctx.lineTo(vpX1, vpY1);
            }
            ctx.stroke();
        }
        ctx.restore();

        const ownNationId = 0; // TODO

        // colonized vertices (own nation)
        ctx.save();
        {
            ctx.fillStyle = "green";
            ctx.lineWidth = 5;
            points.forEach(({ vpCoor }, vertexIdx) => {

                const targetNationId = colonized[vertexIdx];
                if (targetNationId !== ownNationId) {
                    return;
                }

                const [vpX, vpY] = vpCoor;
                const radius = 10;

                if (!this.operator.isCircleInView(vpCoor, radius)) {
                    return;
                }
                ctx.beginPath();
                ctx.strokeStyle = getColor(targetNationId);
                ctx.arc(vpX, vpY, radius, 0, TWO_PI);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            });
        }
        ctx.restore();

        // colonized vertices (neutral)
        ctx.save();
        {
            ctx.fillStyle = "yellow";
            ctx.lineWidth = 5;
            points.forEach(({ vpCoor }, vertexIdx) => {

                const targetNationId = colonized[vertexIdx];
                if (targetNationId < 0 || targetNationId === ownNationId || galaxy.interop_is_at_war_with(ownNationId, targetNationId)) {
                    return;
                }

                const [vpX, vpY] = vpCoor;
                const radius = 10;

                if (!this.operator.isCircleInView(vpCoor, radius)) {
                    return;
                }
                ctx.beginPath();
                ctx.strokeStyle = getColor(targetNationId);
                ctx.arc(vpX, vpY, radius, 0, TWO_PI);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            });
        }
        ctx.restore();

        // colonized vertices (hostile)
        ctx.save();
        {
            ctx.fillStyle = "red";
            ctx.lineWidth = 5;
            ctx.beginPath();
            points.forEach(({ vpCoor }, vertexIdx) => {

                const targetNationId = colonized[vertexIdx];
                if (targetNationId < 0 || targetNationId === ownNationId || !galaxy.interop_is_at_war_with(ownNationId, targetNationId)) {
                    return;
                }

                const [vpX, vpY] = vpCoor;
                const radius = 10;

                if (!this.operator.isCircleInView(vpCoor, radius)) {
                    return;
                }
                ctx.beginPath();
                ctx.strokeStyle = getColor(targetNationId);
                ctx.arc(vpX, vpY, radius, 0, TWO_PI);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            });
        }
        ctx.restore();

        // uncolonized vertices
        ctx.save();
        {
            ctx.fillStyle = "white";
            ctx.beginPath();
            points.forEach(({ vpCoor }, vertexIdx) => {

                if (colonized[vertexIdx] >= 0) {
                    return;
                }

                const [vpX, vpY] = vpCoor;
                const radius = 10;

                if (!this.operator.isCircleInView(vpCoor, radius)) {
                    return;
                }

                ctx.arc(vpX, vpY, radius, 0, TWO_PI);
                ctx.closePath();
            });
            ctx.fill();
        }
        ctx.restore();

        // draw units
        const soldierWidth = 5;
        const soldierHeight = 10;
        ctx.save();
        {
            ctx.beginPath();
            ctx.fillStyle = "purple";
            points.map(({ vpCoor }, i) => {
                if (!galaxy.has_division(this.planetId, i)) {
                    return;
                }

                const [vpX, vpY] = vpCoor;
                const vpFinal: Vec2D = [vpX, vpY - 10];
                const [vpXFinal, vpYFinal] = vpFinal;

                if (!this.operator.isRectInView(vpFinal, soldierWidth, soldierHeight)) {
                    return;
                }

                ctx.rect(vpXFinal, vpYFinal, soldierWidth, soldierHeight);
            });
            ctx.fill();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.textAlign = "center";
        points.map(({ vpCoor }, i) => {
            const text = `${i}(${db.galaxy.get_city_idx(this.planetId, i)})`;
            const metric = ctx.measureText(text);
            const height = 20; // an estimate
            const width = metric.width;
            const [vpX, vpY] = vpCoor;
            const tVpX = vpX;
            const tVpY = vpY - 8;
            const testCoor = subtract([tVpX, tVpY], [width / 2, height / 2]);
            if (this.operator.isRectInView(testCoor, metric.width, height)) {
                ctx.fillText(text, tVpX, tVpY);
            }
        });

        ctx.restore();
    }

    private getColonizedMap() {
        return this.db.galaxy.get_colonized_map(this.planetId);
    }

    private pan = (e: HammerInput) => {
        this.panTo([e.deltaX, e.deltaY]);
    }

    private panTo(vpOffset: Vec2D) {
        this.updatePanAnimation = this.operator.panTo(vpOffset);
    }

    private wheel = (e: WheelEvent) => {
        e.preventDefault();
        this.updatePanAnimation = undefined;
        this.operator.zoom(e);
        this.shouldRedrawView = true;
    }

    /*
    private updateColonyView(colonyId: IColonyId | null, flags: Set<ChannelKind>) {

        const db = this.db;

        if (colonyId !== null) {
            if (this.colonyView === undefined) {
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            } else if (colonyId !== this.colonyView.colonyId) {
                this.colonyView.remove();
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            }
        }
        if (this.colonyView !== undefined) {
            this.colonyView.update(flags);
        }
    }
    */

    private layout() {

        clearChildren(this.canvas);

        const planetId = this.planetId;
        const db = this.db;

        //  const info = db.getPlanetInfo(this.planetId);

        //   setIfDiff(this.planetName, info.name);
    }

    private setClickTileIdx = (idx: number) => () => {
        this.tileId = idx;
    }
}

customElements.define("planet-view", PlanetView);
