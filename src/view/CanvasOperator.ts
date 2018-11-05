import { add, determinant, dot, norm, project, subtract, Vec2D } from "myalgo-ts";
import { get_planet_vertex_dist } from "../../galaxy";
import { IViewData } from "../database";
import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "./def";

const ZOOM_FACTOR = 1.5;

export class CanvasOperator {

    public static readonly planetVertexDist = get_planet_vertex_dist();

    constructor(public readonly canvas: HTMLCanvasElement, public readonly viewData: IViewData) { }

    public toVpCoor([x, y]: Vec2D): Vec2D {

        console.assert(Number.isFinite(x));
        console.assert(Number.isFinite(y));

        const viewData = this.viewData;
        const { diffFromOrigin, gridSize } = viewData;

        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;

        const [cx, cy] = diffFromOrigin;
        const canvasWidth = width / 2;
        const canvasHeight = height / 2;

        const retX = (x + cx) * gridSize + canvasWidth;
        const retY = (y + cy) * gridSize + canvasHeight;

        console.assert(Number.isFinite(retX));
        console.assert(Number.isFinite(retY));

        return [retX, retY];
    }

    public toGameCoor([vpX, vpY]: Vec2D): Vec2D {

        const { diffFromOrigin, gridSize } = this.viewData;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;

        const canvasWidth2 = width / 2;
        const canvasHeight2 = height / 2;
        const [cx, cy] = diffFromOrigin;
        return [
            (vpX - canvasWidth2) / gridSize - cx,
            (vpY - canvasHeight2) / gridSize - cy,
        ];
    }

    public get vpDiffFromOrigin(): Vec2D {
        const viewData = this.viewData;
        const { diffFromOrigin } = viewData;
        return this.toVpCoor(diffFromOrigin);
    }

    public get centerOfCameraInGameCoor(): Vec2D {
        const viewData = this.viewData;
        const { diffFromOrigin } = viewData;
        return subtract([0, 0], diffFromOrigin);
    }

    public isCircleInView(vpCoor: Vec2D, radius: number) {

        // use a cheap check by treating the circle as a square
        const twoR = 2 * radius;
        const topLeft = subtract(vpCoor, [radius, radius]);

        return this.isRectInView(topLeft, twoR, twoR);
    }

    public isPointInView([vpX, vpY]: Vec2D) {
        return vpX >= 0 && vpX <= this.canvas.width && vpY >= 0 && vpY <= this.canvas.height;
    }

    public isSegmentIntersectSegment(p1: Vec2D, p2: Vec2D, q1: Vec2D, q2: Vec2D) {
        const r = subtract(p2, p1);
        console.assert(norm(r) > 0);
        const s = subtract(q2, q1);
        console.assert(norm(s) > 0);
        const qMinusP = subtract(p1, q1);
        const qMinusPCrossR = determinant(qMinusP, r);
        const rCrossS = determinant(r, s);

        if (qMinusPCrossR === 0 && rCrossS === 0) {
            // collinear
            //   t0 = (q − p) · r / (r · r)
            //   t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
            const rSquared = dot(r, r);
            const sDotr = dot(s, r);
            const t0 = dot(qMinusP, r) / rSquared;
            const t1 = t0 + sDotr / rSquared;
            return (t0 >= 0 && t0 <= 1) || (t1 >= 0 && t1 <= 1); // collinear and overlapping if true
        }

        if (rCrossS === 0) { // implicitly qMinusPCrossR !== 0
            return false; // parallel and non-overlapping
        }

        // t = (q − p) × s / (r × s)
        const t = determinant(qMinusP, s) / rCrossS;
        // u = (q − p) × r / (r × s)
        const u = qMinusPCrossR / rCrossS;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    public isSegmentInView(vp1: Vec2D, vp2: Vec2D) {
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;

        return this.isSegmentIntersectSegment(vp1, vp2, [0, 0], [0, width]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [0, 0], [0, height]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [width, 0], [0, height]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [width, 0], [width, height])
            ;

        // return this.isPointInView(vpCoor1) || this.isPointInView(vpCoor2);
    }

    public isRectInView(vpCoor: Vec2D, width: number, height: number) {

        // https://stackoverflow.com/a/306332
        const ax1 = 0;
        const ay1 = 0;
        const canvas = this.canvas;
        const ax2 = canvas.width;
        const ay2 = canvas.height;

        const [bx1, by1] = vpCoor;
        const bx2 = bx1 + width;
        const by2 = by1 + height;

        return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
    }

    public getOffsetFromTopLeft(e: HammerInput): Vec2D {
        const bb = e.target.getBoundingClientRect();
        return [
            e.center.x - bb.left,
            e.center.y - bb.top,
        ];
    }

    public getOffsetFromCenter(e: HammerInput): Vec2D {
        const canvas = this.canvas;
        return [
            e.center.x - canvas.offsetLeft - canvas.width / 2,
            e.center.y - canvas.offsetTop - canvas.height / 2,
        ];
    }

    /**
     * Returns an animation function. The animation function should be deregistered when it returns true.
     */
    public panTo(vpOffset: Vec2D) {

        const viewData = this.viewData;
        const vpDiffFromOrigin = this.vpDiffFromOrigin;
        const diffFromOrigin = this.viewData.diffFromOrigin;
        const vpCoor = add(vpOffset, vpDiffFromOrigin);
        const to = this.toGameCoor(vpCoor);

        const offset = subtract(to, diffFromOrigin);

        const dist = norm(offset);

        let i = 0;
        const numPans = 30;
        const speed = dist / numPans;
        const proj = project(offset, speed);

        return () => {
            if (dist < 1 || ++i === numPans) {
                return true;
            }

            const [px, py] = proj;
            const next = subtract(viewData.diffFromOrigin, [px, py]);
            viewData.diffFromOrigin = next;
            return false;
        };
    }

    public zoom(e: WheelEvent) {

        const viewData = this.viewData;

        const isZoomingIn = e.deltaY < 0;
        if (isZoomingIn) {
            viewData.gridSize = Math.min(MAX_GRID_SIZE, viewData.gridSize * ZOOM_FACTOR);
        } else {
            viewData.gridSize = Math.max(MIN_GRID_SIZE, viewData.gridSize / ZOOM_FACTOR);
        }
    }
}
