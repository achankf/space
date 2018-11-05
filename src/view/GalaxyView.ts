import * as Hammer from "hammerjs";
import { distance, Vec2D } from "myalgo-ts";
import { get_city_circle_radius } from "../../galaxy";
import { ChannelKind, Database, ISubscriber } from "../database";
import { CanvasOperator } from "./CanvasOperator";
import { TWO_PI } from "./def";
import { IDrawGalaxyData } from "./def2";

const CITY_CIRCLE_RADIUS = get_city_circle_radius();

// tslint:disable-next-line:max-classes-per-file
export class GalaxyView
    extends HTMLCanvasElement
    implements ISubscriber {

    private ctx = this.getContext("2d")!;
    private cachedGrid = document.createElement("canvas");
    private updatePanAnimation?: () => boolean;
    private frameRequestId?: number;
    private operator: CanvasOperator;

    private cityImage = new Map<number, [HTMLCanvasElement, number]>(); // planet idx -> (canvas, gridSize)

    private shouldUpdateGrid = true;
    private shouldRedrawView = true;

    constructor(private db: Database) {
        super();
        console.assert(this.ctx !== undefined);
        const canvas = this;
        canvas.className = "map";
        window.addEventListener("resize", this.resizeCanvas, true);

        const gesture = new Hammer.Manager(this);
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

        this.addEventListener("wheel", this.wheel, { passive: true });
        this.addEventListener("mousemove", this.mousemove);

        this.operator = new CanvasOperator(this, db.galaxyViewData);

        this.draw();
    }

    public update(flags: Set<ChannelKind>) {
        if (flags.has(ChannelKind.Galaxy)) {
            this.shouldRedrawView = true;
        }
    }

    public suspend() {
        if (this.frameRequestId === undefined) {
            console.assert(false);
            throw new Error("no need to suspend drawing");
        }
        window.cancelAnimationFrame(this.frameRequestId);
        this.frameRequestId = undefined;
    }

    public resume() {
        if (this.frameRequestId !== undefined) {
            console.assert(false);
            throw new Error("no need to resume drawing");
        }
        this.draw();
    }

    private draw = () => {

        this.resizeCanvas();

        if (this.updatePanAnimation) {
            if (this.updatePanAnimation()) {
                this.updatePanAnimation = undefined;
            }
            this.shouldUpdateGrid = true;
            this.shouldRedrawView = true;
        }

        if (this.shouldUpdateGrid) {
            this.updateCachedGrid();
        }

        const canvas = this;
        const ctx = this.ctx;

        if (this.shouldRedrawView &&
            canvas.width !== 0 && canvas.height !== 0
        ) {

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.drawImage(this.cachedGrid, 0, 0);
            this.drawObjects();
        }

        this.shouldRedrawView = false;
        this.shouldUpdateGrid = false;
        this.frameRequestId = requestAnimationFrame(this.draw);
    }

    /** Return true if resized; false otherwise */
    private resizeCanvas = () => {
        const canvas = this;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (canvas.width !== width ||
            canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            this.cachedGrid.width = width;
            this.cachedGrid.height = height;
            this.shouldUpdateGrid = true;
            this.shouldRedrawView = true;
        }
    }

    private doubleClick = (e: HammerInput) => {
        const vpOffset: Vec2D = [
            e.center.x - this.width / 2,
            e.center.y - this.height / 2,
        ];
        this.panTo(vpOffset);
    }

    private singleClick = (e: HammerInput) => {
        const bb = e.target.getBoundingClientRect();
        const vpOffset: Vec2D = [
            e.center.x - bb.left,
            e.center.y - bb.top,
        ];
        const [x, y] = this.operator.toGameCoor(vpOffset);
        const db = this.db;
        console.log(`game:(${x},${y}), vp:(${vpOffset})`);
        db.handleCoorSearch(x, y);
    }

    private wheel = (e: WheelEvent) => {
        this.updatePanAnimation = undefined;
        this.operator.zoom(e);
        this.shouldUpdateGrid = true;
        this.shouldRedrawView = true;
    }

    private mousemove = (e: MouseEvent) => {
        const [x, y] = this.operator.toGameCoor([e.clientX - this.offsetLeft, e.clientY - this.offsetTop]);
        const db = this.db;
        // console.log(this.offsetLeft, this.offsetTop, e.clientX, e.clientY, x, y);
        // db.search_exact(x, y);
    }

    private drawObjects() {

        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;

        // extract boundary and search it in the index
        const topLeft = this.operator.toGameCoor([0, 0]);
        const bottomRight = this.operator.toGameCoor([this.width, this.height]);
        const drawData = db.calDrawData(topLeft, bottomRight, gridSize);

        this.drawCelestrialObjects(drawData);
        this.tryDrawCities(drawData);
    }

    private drawCelestrialObjects(drawData: IDrawGalaxyData) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const ctx = this.ctx;
        ctx.save();

        // Set up the affine transformation matrix, so that drawing calls can be done in model coordinates.
        {
            // move viewport to the origin (which is the center of the screen, due to easy zooming)
            ctx.translate(this.width / 2, this.height / 2);

            ctx.scale(viewData.gridSize, viewData.gridSize);

            // move to the location that user has panned to
            const [dox, doy] = viewData.diffFromOrigin;
            ctx.translate(dox, doy);
        }

        // scale lines and texts manually so that the size stays constant
        ctx.lineWidth = 1 / viewData.gridSize;
        ctx.setLineDash([5 / viewData.gridSize, 3 / viewData.gridSize]);
        ctx.font = `${Math.ceil(10 / viewData.gridSize)}px san-serifs`;

        {
            // star
            ctx.fillStyle = "yellow";
            // star label
            ctx.textAlign = "center";
            ctx.beginPath();
            for (const { radius, x, y } of drawData.stars) {
                ctx.arc(x, y, radius, 0, TWO_PI);
                ctx.closePath();
            }
            ctx.fill();

            // draw planet orbits
            ctx.strokeStyle = "white";
            for (const { x, y, cx, cy } of drawData.planets) {
                ctx.beginPath();
                const orbitRadius = distance([cx, cy], [x, y]);
                ctx.arc(cx, cy, orbitRadius, 0, TWO_PI);
                ctx.closePath();
                ctx.stroke();
            }

            // draw planets
            ctx.fillStyle = "green";
            ctx.beginPath();
            for (const { radius, x, y } of drawData.planets) {
                ctx.arc(x, y, radius, 0, TWO_PI);
                ctx.closePath();
            }
            ctx.fill();

            // draw star labels
            ctx.beginPath();
            ctx.fillStyle = "yellow";
            for (const { name, x, y, radius } of drawData.stars) {
                ctx.fillText(name, x, y - radius - 3);
            }

            // draw planet labels
            ctx.beginPath();
            ctx.fillStyle = "green";
            for (const { name, x, y, radius } of drawData.planets) {
                ctx.fillText(name, x, y - radius - 3);
            }
        }
        ctx.restore();
    }

    private tryDrawCities(drawData: IDrawGalaxyData) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;

        if (CITY_CIRCLE_RADIUS * viewData.gridSize < 0.5) {
            return;
        }

        for (const { idx, x, y, radius } of drawData.planets) {

            const image = this.cityImage.get(idx);

            // try load from cache
            if (image !== undefined && image[1] === gridSize) {
                const [canvas] = image;
                const [vpX, vpY] = this.operator.toVpCoor([x - radius, y - radius]);
                this.ctx.drawImage(canvas, vpX, vpY);
                return;
            }

            const cityCanvas = document.createElement("canvas");
            const ctx = cityCanvas.getContext("2d")!;
            cityCanvas.width = cityCanvas.height = 2 * radius * gridSize;

            ctx.save();
            {
                ctx.scale(gridSize, gridSize);
                ctx.translate(radius, radius);
                const points = new Float32Array(db.getPlanetVerticesCoors(idx));
                let k = 0;
                for (let i = 0; i < points.length; i += 2, ++k) {
                    const cityX = points[i];
                    const cityY = points[i + 1];

                    const baseStructureSize = 1;

                    // draw fancy detailed city (when zoomed enough)
                    if (baseStructureSize >= 1) {

                        const graph = this.db.galaxy.cal_city_graph(idx, k);
                        const numStructures = graph.num_structures;

                        if (numStructures > 0) {

                            const detailCityPoints = graph.get_points();
                            const dims = graph.get_dims();
                            const roads = graph.get_roads();

                            ctx.save();
                            {
                                ctx.translate(cityX, cityY);

                                ctx.save();
                                ctx.lineWidth = 0.1 / gridSize;
                                {
                                    ctx.beginPath();
                                    ctx.shadowColor = "yellow";
                                    ctx.shadowBlur = 20;
                                    ctx.strokeStyle = "yellow";
                                    for (let j = 0; j < roads.length; j += 2) {
                                        console.assert(roads[j] !== roads[j + 1]);
                                        const uIdx = 2 * roads[j];
                                        const vIdx = 2 * roads[j + 1];
                                        console.assert(uIdx !== vIdx);
                                        const x0 = detailCityPoints[uIdx];
                                        const y0 = detailCityPoints[uIdx + 1];
                                        const x1 = detailCityPoints[vIdx];
                                        const y1 = detailCityPoints[vIdx + 1];
                                        ctx.moveTo(x0, y0);
                                        ctx.lineTo(x1, y1);
                                    }
                                    ctx.stroke();

                                }
                                ctx.restore();

                                ctx.beginPath();
                                ctx.fillStyle = "yellow";
                                for (let j = 0; j < detailCityPoints.length; j += 2) {
                                    const structX = detailCityPoints[j];
                                    const structY = detailCityPoints[j + 1];
                                    const w = dims[j];
                                    const h = dims[j + 1];
                                    ctx.rect(structX, structY, w, h);
                                }
                                ctx.fill();
                            }
                            ctx.restore();
                        }

                        graph.free();
                    }
                }

                const edges = db.getPlanetEdges(idx);
                ctx.save();
                {
                    ctx.beginPath();
                    ctx.shadowColor = "yellow";
                    ctx.shadowBlur = 20;
                    ctx.strokeStyle = "yellow";
                    ctx.fillStyle = "white";
                    ctx.lineWidth = 0.5 / gridSize;
                    for (let i = 0; i < edges.length; i += 2) {
                        const idx0 = 2 * edges[i];
                        const idx1 = 2 * edges[i + 1];
                        const x0 = points[idx0];
                        const y0 = points[idx0 + 1];
                        const x1 = points[idx1];
                        const y1 = points[idx1 + 1];

                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x1, y1);
                    }
                    ctx.stroke();
                }
                ctx.restore();

                ctx.beginPath();
                ctx.fillStyle = "white";
                for (let i = 0; i < points.length; i += 2) {
                    const cityX = points[i];
                    const cityY = points[i + 1];
                    ctx.arc(cityX, cityY, CITY_CIRCLE_RADIUS, 0, TWO_PI);
                    ctx.closePath();
                }
                ctx.fill();
            }
            ctx.restore();

            {
                this.cityImage.set(idx, [cityCanvas, gridSize]);
                const [vpX, vpY] = this.operator.toVpCoor([x - radius, y - radius]);
                this.ctx.drawImage(cityCanvas, vpX, vpY);
            }
        }
    }

    private updateCachedGrid() {
        /*
                const canvas = this.cachedGrid;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    throw new Error("cannot create context");
                }

                const db = this.db;
                const viewData = db.galaxyViewData;
                const gridSize = viewData.gridSize;
                const center = viewData.center;

                const gridColor = "#0c0c0c";

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.save();
                ctx.lineWidth = 1;
                ctx.strokeStyle = gridColor;
                ctx.translate(0.5, 0.5);

                const [cx, cy] = center;

                // truncate to the nearest integer (every lines on the grid lie on the integers)
                const x = Math.floor(cx);
                const y = Math.floor(cy);
                const [vpX, vpY] = this.operator.toVpCoor([x, y]);

                // draw small grid

                ctx.beginPath();

                if (gridSize >= MIN_SHOW_GRID_SIZE) {
                    // draw all vertical lines
                    const numVert = Math.ceil(this.width / gridSize);
                    let curVpX = vpX % gridSize;

                    for (let i = 0; i <= numVert; i++) {
                        ctx.moveTo(curVpX, 0);
                        ctx.lineTo(curVpX, canvas.height);
                        curVpX += gridSize;
                    }

                    // draw all horizontal lines
                    const numHori = Math.ceil(this.height / gridSize);
                    let curVpY = vpY % gridSize;
                    for (let i = 0; i <= numHori; i++) {
                        ctx.moveTo(0, curVpY);
                        ctx.lineTo(canvas.width, curVpY);
                        curVpY += gridSize;
                    }
                }

                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.translate(0.5, 0.5);
                if (gridSize >= MIN_SHOW_GRID_SIZE) {
                    ctx.strokeStyle = "#282828";
                } else {
                    ctx.strokeStyle = gridColor;
                }
                {
                    const xBig = x - (x % BIG_GRID_FACTOR);
                    const yBig = y - (y % BIG_GRID_FACTOR);
                    const bigGridSize = BIG_GRID_FACTOR * gridSize;
                    const [vpXBig, vpYBig] = this.operator.toVpCoor([xBig, yBig]);

                    ctx.beginPath();
                    const numVert = Math.ceil(this.width / bigGridSize);
                    let curVpX = vpXBig % bigGridSize;
                    for (let i = 0; i <= numVert; i++) {
                        ctx.moveTo(curVpX, 0);
                        ctx.lineTo(curVpX, canvas.height);
                        curVpX += bigGridSize;
                    }

                    // draw all horizontal lines
                    const numHori = Math.ceil(this.height / bigGridSize);
                    let curVpY = vpYBig % bigGridSize;
                    for (let i = 0; i <= numHori; i++) {
                        ctx.moveTo(0, curVpY);
                        ctx.lineTo(canvas.width, curVpY);
                        curVpY += bigGridSize;
                    }

                    ctx.stroke();
                }
                ctx.restore();
                */
    }

    private pan = (e: HammerInput) => {
        this.panTo([e.deltaX, e.deltaY]);
    }

    private panTo(vpOffset: Vec2D) {
        this.updatePanAnimation = this.operator.panTo(vpOffset);
    }
}

customElements.define("map-view", GalaxyView, { extends: "canvas" });
