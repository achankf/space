export interface IObserver<T> {
    update(): void;
}

export class Subject<T>{

    private observers = new Set<IObserver<T>>();

    constructor(private _prevState: T) { }

    public set nextState(t: T) {
        console.assert(t !== undefined && t !== null, "next state should not be null or undefined");
        this._prevState = t;
        this.notify();
    }

    public get prevState() { return this._prevState; }

    public notify() {
        for (const observer of this.observers) {
            observer.update();
        }
    }

    public add(observer: IObserver<T>) {
        console.assert(!this.observers.has(observer), "double-subscribing the same observer");
        this.observers.add(observer);
    }

    public delete(observer: IObserver<T>) {
        const isDeleted = this.observers.delete(observer);
        console.assert(isDeleted, "unsubscribing a non-exist observer");
    }
}