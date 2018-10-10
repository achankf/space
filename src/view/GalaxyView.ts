import * as Hammer from "hammerjs";
import { distance, subtract, Vec2D } from "myalgo-ts";
import { SpacecraftKind } from "../../galaxy";
import { ChannelKind, Database, ISubscriber } from "../database";
import { CanvasOperator } from "./CanvasOperator";
import { BIG_GRID_FACTOR, MIN_SHOW_GRID_SIZE, TWO_PI } from "./def";

// tslint:disable-next-line:max-classes-per-file
export class GalaxyView
    extends HTMLCanvasElement
    implements ISubscriber {

    private ctx = this.getContext("2d")!;
    private cachedGrid = document.createElement("canvas");
    private updatePanAnimation?: () => boolean;
    private frameRequestId?: number;
    private operator: CanvasOperator;

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

    private getOffsetFromTopLeft(e: HammerInput): Vec2D {
        const bb = e.target.getBoundingClientRect();
        return [
            e.center.x - bb.left,
            e.center.y - bb.top,
        ];
    }

    private getOffsetFromCenter(e: HammerInput): Vec2D {
        return [
            e.center.x - this.width / 2,
            e.center.y - this.height / 2,
        ];
    }

    private doubleClick = (e: HammerInput) => {
        const vpOffset = this.getOffsetFromCenter(e);
        this.panTo(vpOffset);
    }

    private singleClick = (e: HammerInput) => {
        const vpOffset = this.getOffsetFromTopLeft(e);
        const [x, y] = this.operator.toGameCoor(vpOffset);
        const db = this.db;
        db.handleCoorSearch(x, y);
    }

    private wheel = (e: WheelEvent) => {
        this.updatePanAnimation = undefined;
        this.operator.zoom(e);
        this.shouldUpdateGrid = true;
        this.shouldRedrawView = true;
    }

    private drawPlanet(name: string, coor: Vec2D, radius: number, centerCoor: Vec2D) {

        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const scaledRadius = radius * gridSize;

        const ctx = this.ctx;
        ctx.save();

        const vpCoor = this.operator.toVpCoor(coor);
        const [vpX, vpY] = vpCoor;

        // draw orbit
        console.assert(centerCoor !== undefined);
        const cVpCoor = this.operator.toVpCoor(centerCoor);
        const cRadius = distance(cVpCoor, vpCoor);
        const [cVpX, cVpY] = cVpCoor;
        if (this.isCircleInView(cVpCoor, cRadius)) {
            ctx.beginPath();
            ctx.arc(cVpX, cVpY, cRadius, 0, TWO_PI);
            ctx.stroke();
        }

        // draw planets
        if (this.isCircleInView(vpCoor, scaledRadius)) {
            ctx.beginPath();
            ctx.arc(vpX, vpY, scaledRadius, 0, TWO_PI);
            ctx.fill();
        }

        // draw planet names
        const metric = ctx.measureText(name);
        const height = 20; // an estimate
        const width = metric.width;
        const tVpX = vpX;
        const tVpY = vpY - scaledRadius - 5;
        const testCoor = subtract([tVpX, tVpY], [width / 2, height / 2]);
        if (this.isRectInView(testCoor, metric.width, height)) {
            ctx.fillText(name, tVpX, tVpY);
        }

        ctx.restore();
    }

    private isCircleInView(vpCoor: Vec2D, radius: number) {

        // use a cheap check by treating the circle as a square
        const twoR = 2 * radius;
        const topLeft = subtract(vpCoor, [radius, radius]);

        return this.isRectInView(topLeft, twoR, twoR);
    }

    private isRectInView(vpCoor: Vec2D, width: number, height: number) {

        // https://stackoverflow.com/a/306332
        const ax1 = 0;
        const ay1 = 0;
        const ax2 = this.width;
        const ay2 = this.height;

        const [bx1, by1] = vpCoor;
        const bx2 = bx1 + width;
        const by2 = by1 + height;

        return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
    }

    private drawStar(name: string, radiusGame: number, x: number, y: number) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const ctx = this.ctx;

        const [vpX, vpY] = this.operator.toVpCoor([x, y]);

        const radius = Math.max(1, radiusGame * gridSize);

        ctx.beginPath();
        ctx.arc(vpX, vpY, radius, 0, TWO_PI);
        ctx.fill();

        const metric = ctx.measureText(name);
        const height = 20; // an estimate
        const width = metric.width;
        const tVpX = vpX;
        const tVpY = vpY - radius - 5;
        const testCoor = subtract([tVpX, tVpY], [width / 2, height / 2]);
        if (this.isRectInView(testCoor, metric.width, height)) {
            ctx.fillText(name, tVpX, tVpY);
        }
    }

    private drawShip(radiusGame: number, x: number, y: number) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const ctx = this.ctx;

        const [vpX, vpY] = this.operator.toVpCoor([x, y]);

        const radius = Math.max(1, radiusGame * gridSize);

        if (radius < 1) {
            return;
        }

        ctx.beginPath();
        ctx.arc(vpX, vpY, radius, 0, TWO_PI);
        ctx.fill();
    }

    private drawObjects() {

        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;

        // extract boundary and search it in the index
        const [tlX, tlY] = this.operator.toGameCoor([0, 0]);
        const [brX, brY] = this.operator.toGameCoor([this.width, this.height]);

        const drawData = db.calDrawData(tlX, tlY, brX, brY, gridSize);
        const ctx = this.ctx;

        ctx.save();
        // star
        ctx.fillStyle = "yellow";
        // star label
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const { name, radius, x, y } of drawData.stars) {
            this.drawStar(name, radius, x, y);
        }

        // orbit
        ctx.strokeStyle = "white";
        ctx.setLineDash([5, 3]);

        // planet
        ctx.fillStyle = "green";

        // planet label
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const { name, radius, x, y, cx, cy } of drawData.planets) {
            const coor: Vec2D = [x, y];
            const centerCoor: Vec2D = [cx, cy];
            this.drawPlanet(name, coor, radius, centerCoor);
        }

        for (const { kind, radius, x, y } of drawData.ships) {
            console.log("{0} {1}", kind, SpacecraftKind[kind]);
            this.drawShip(radius, x, y);
        }

        ctx.restore();
    }

    private updateCachedGrid() {

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
    }

    private pan = (e: HammerInput) => {
        this.panTo([e.deltaX, e.deltaY]);
    }

    private panTo(vpOffset: Vec2D) {
        this.updatePanAnimation = this.operator.panTo(vpOffset);
    }
}

customElements.define("map-view", GalaxyView, { extends: "canvas" });
