import * as Hammer from "hammerjs";
import { add, distance, groupBy, makePair, makeSet, norm, project, subtract, Vec2D } from "myalgo-ts";
import { ChannelKind, Database, ISubscriber } from "../database";
import { Hash2DFactor, IGalaxy, MassKind } from "../model/def";
import { cal2DHash, getMass } from "../model/galaxy";
import { BIG_GRID_FACTOR, MAX_GRID_SIZE, MIN_GRID_SIZE, MIN_SHOW_GRID_SIZE, TWO_PI } from "./def";

export class GalaxyView
    extends HTMLCanvasElement
    implements ISubscriber {

    private ctx = this.getContext("2d")!;
    private cachedGrid = document.createElement("canvas");
    private updatePanAnimation?: () => void;
    private frameRequestId?: number;

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
            new Hammer.Pinch(),
            double,
            single,
            pan,
        ]);
        double.recognizeWith(single);
        single.requireFailure(double);

        // setup events
        gesture.on("singletap", this.singleClick);
        gesture.on("doubletap", this.doubleClick);
        gesture.on("pinch", this.wheel);
        gesture.on("pan", this.pan);

        this.addEventListener("wheel", this.wheel, { passive: true });

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
            this.updatePanAnimation();
            this.shouldUpdateGrid = true;
            this.shouldRedrawView = true;
        }

        /*
        const updateAnimation = this.updateAnimation;
        if (updateAnimation) {
            updateAnimation();
            this.shouldUpdateGrid = true;
            this.shouldRedrawView = true;
        }
        */

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
        const gameCoor = this.toGameCoor(vpOffset);
        const db = this.db;
        const results = db.search(gameCoor);

        for (const [id, data] of results) {
            switch (data.massKind) {
                case MassKind.Planet:
                    db.switchPlanetTab(id);
                    break;
                case MassKind.Star:
                    break; // TODO ignore for now
                default:
                    throw new Error("not handled");
            }
        }
    }

    private toVpCoor([x, y]: Vec2D): Vec2D {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const center = viewData.center;

        const [cx, cy] = center;
        const canvasWidth2 = this.width / 2;
        const canvasHeight2 = this.height / 2;
        return [
            Math.floor((x + cx) * gridSize + canvasWidth2),
            Math.floor((y + cy) * gridSize + canvasHeight2),
        ];
    }

    private toGameCoor([vpX, vpY]: Vec2D): Vec2D {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const center = viewData.center;

        const canvasWidth2 = this.width / 2;
        const canvasHeight2 = this.height / 2;
        const [cx, cy] = center;
        return [
            (vpX - canvasWidth2) / gridSize - cx,
            (vpY - canvasHeight2) / gridSize - cy,
        ];
    }

    private get vpCenter(): Vec2D {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const center = viewData.center;
        return this.toVpCoor(center);
    }

    private wheel = (e: WheelEvent | HammerInput) => {

        const isZoomingIn = e.deltaY < 0;
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const val = 1;
        if (isZoomingIn) {
            viewData.gridSize = Math.min(MAX_GRID_SIZE, gridSize + val);
        } else {
            viewData.gridSize = Math.max(MIN_GRID_SIZE, gridSize - val);
        }
        this.shouldUpdateGrid = true;
    }

    private drawPlanets(galaxy: IGalaxy, planets: Array<[symbol, Vec2D]>) {

        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;

        // extract planets that are large enough to draw on the canvas (scaled by gridSize)
        const largeEnough = planets
            .map(([id, coor]) => {

                const planet = galaxy.planets.get(id)!;
                console.assert(planet !== undefined);
                const radius = planet.radius * gridSize;

                return {
                    coor,
                    id,
                    planet,
                    radius,
                };
            })
            .filter(({ radius }) => radius >= 1)
            .map((temp) => ({
                ...temp,
                vpCoor: this.toVpCoor(temp.coor),
            }));

        const ctx = this.ctx;
        ctx.save();

        // draw orbit
        ctx.strokeStyle = "white";
        ctx.setLineDash([5, 3]);
        for (const { planet, vpCoor } of largeEnough) {
            const centerLoc = galaxy.locs.get(planet.center)!;
            console.assert(centerLoc !== undefined);
            const cVpCoor = this.toVpCoor(centerLoc);
            const cRadius = distance(cVpCoor, vpCoor);
            const [cVpX, cVpY] = cVpCoor;
            if (this.isCircleInView(cVpCoor, cRadius)) {
                ctx.beginPath();
                ctx.arc(cVpX, cVpY, cRadius, 0, TWO_PI);
                ctx.stroke();
            }
        }

        // draw planets
        ctx.fillStyle = "green";
        for (const { radius, vpCoor } of largeEnough) {
            const [vpX, vpY] = vpCoor;
            if (this.isCircleInView(vpCoor, radius)) {
                ctx.beginPath();
                ctx.arc(vpX, vpY, radius, 0, TWO_PI);
                ctx.fill();
            }
        }

        // draw planet names
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const { planet, radius, vpCoor } of largeEnough) {
            const metric = ctx.measureText(planet.name);
            const height = 20; // an estimate
            const width = metric.width;
            const [vpX, vpY] = vpCoor;
            const tVpX = vpX;
            const tVpY = vpY - radius - 5;
            const testCoor = subtract([tVpX, tVpY], [width / 2, height / 2]);
            if (this.isRectInView(testCoor, metric.width, height)) {
                ctx.fillText(planet.name, tVpX, tVpY);
            }
        }

        ctx.restore();
    }

    private isCircleInView(vpCoor: Vec2D, radius: number) {

        // use a cheap check by treating the circle as a square
        const twoR = 2 * radius;
        const topLeft = subtract(vpCoor, [radius, radius]);

        return this.isRectInView(topLeft, twoR, twoR);

        /*
        const tl: Vec2D = [0, 0];
        const tr: Vec2D = [this.width, 0];
        const bl: Vec2D = [0, this.height];
        const br: Vec2D = [this.width, this.height];

        // https://stackoverflow.com/a/402019
        return isPointInRect(vpCoor, tl, br) ||
            testLineCircleIntersect(tl, tr, vpCoor, radius) === IntersectionKind.Intersection ||
            testLineCircleIntersect(tl, bl, vpCoor, radius) === IntersectionKind.Intersection ||
            testLineCircleIntersect(tr, br, vpCoor, radius) === IntersectionKind.Intersection ||
            testLineCircleIntersect(bl, br, vpCoor, radius) === IntersectionKind.Intersection
            ;
            */
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

    private drawStars(galaxy: IGalaxy, stars: Array<[symbol, Vec2D]>) {

        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;

        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "yellow";

        for (const [id, [x, y]] of stars) {

            const star = galaxy.stars.get(id)!;
            console.assert(star !== undefined);

            const [vpX, vpY] = this.toVpCoor([x, y]);

            const radius = Math.max(1, star.radius * gridSize);

            ctx.beginPath();
            ctx.arc(vpX, vpY, radius, 0, TWO_PI);
            ctx.fill();
        }

        for (const [id, [x, y]] of stars) {

            const star = galaxy.stars.get(id)!;
            console.assert(star !== undefined);

            const [vpX, vpY] = this.toVpCoor([x, y]);

            const radius = Math.max(1, star.radius * gridSize);

            ctx.beginPath();
            ctx.arc(vpX, vpY, radius, 0, TWO_PI);
            ctx.fill();

            // draw planet names
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const metric = ctx.measureText(star.name);
            const height = 20; // an estimate
            const width = metric.width;
            const tVpX = vpX;
            const tVpY = vpY - radius - 5;
            const testCoor = subtract([tVpX, tVpY], [width / 2, height / 2]);
            if (this.isRectInView(testCoor, metric.width, height)) {
                ctx.fillText(star.name, tVpX, tVpY);
            }
        }

        ctx.restore();
    }

    private drawObjects() {

        const galaxy = this.db.galaxy;

        const massIds: symbol[] = [];
        {
            // extract boundary and search it in the index
            const [tlX, tlY] = this.toGameCoor([0, 0]);

            // floored
            const startX = Math.floor(tlX / Hash2DFactor);
            const startY = Math.floor(tlY / Hash2DFactor);

            // ceiled
            const [brX, brY] = this.toGameCoor([this.width, this.height]);
            const limitX = Math.ceil(brX / Hash2DFactor);
            const limitY = Math.ceil(brY / Hash2DFactor);

            for (let x = startX; x <= limitX; x++) {
                for (let y = startY; y <= limitY; y++) {
                    const hash = cal2DHash(x, y);
                    const temp = galaxy.cachedLocIdx.get(hash);
                    if (temp !== undefined) {
                        massIds.push(...temp);
                    }
                }
            }
        }

        const group = groupBy(makeSet(massIds).map((x) => makePair(x, galaxy.locs.get(x)!)),
            ([id]) => {
                const mass = getMass(galaxy, id)!;
                console.assert(mass !== undefined);
                return mass.massKind;
            });

        for (const [kind, objects] of group) {
            switch (kind) {
                case MassKind.Star:
                    this.drawStars(galaxy, objects);
                    break;
                case MassKind.Planet:
                    this.drawPlanets(galaxy, objects);
                    break;
            }
        }
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

        const gridColor = "#494949";

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = gridColor;
        ctx.translate(0.5, 0.5);

        const [cx, cy] = center;

        // truncate to the nearest integer (every lines on the grid lie on the integers)
        const x = Math.floor(cx);
        const y = Math.floor(cy);
        const [vpX, vpY] = this.toVpCoor([x, y]);

        // draw small grid
        if (gridSize >= MIN_SHOW_GRID_SIZE) {
            // draw all vertical lines
            const numVert = Math.ceil(this.width / gridSize);
            let curVpX = vpX % gridSize;

            ctx.beginPath();
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
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.translate(0.5, 0.5);
        if (gridSize >= MIN_SHOW_GRID_SIZE) {
            ctx.strokeStyle = "white";
        } else {
            ctx.strokeStyle = gridColor;
        }
        {
            const xBig = x - (x % BIG_GRID_FACTOR);
            const yBig = y - (y % BIG_GRID_FACTOR);
            const bigGridSize = BIG_GRID_FACTOR * gridSize;
            const [vpXBig, vpYBig] = this.toVpCoor([xBig, yBig]);

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

        this.updatePanAnimation = undefined;

        const db = this.db;
        const vpCenter = this.vpCenter;
        const center = this.toGameCoor(vpCenter);
        const vpCoor = add(vpOffset, vpCenter);
        const to = this.toGameCoor(vpCoor);

        const viewData = db.galaxyViewData;
        const offset = subtract(to, center);
        const minSpeed = 0.01 / viewData.gridSize;

        let dist = norm(offset);

        this.updatePanAnimation = () => {
            const speed = dist * 0.05;
            let final;
            if (speed === 0) {
                return; // no change
            }

            if (speed < minSpeed) {
                this.updatePanAnimation = undefined;
                final = dist;
            } else {
                final = speed;
                dist -= speed;
            }
            const proj = project(offset, final);
            viewData.center = subtract(viewData.center, proj);
        };
    }
}

customElements.define("map-view", GalaxyView, { extends: "canvas" });
