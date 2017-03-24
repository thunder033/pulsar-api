/**
 * Created by Greg on 3/24/2017.
 */
import {enumerable} from './decorators';

class StateListener {
    private state: number;
    private callback: Function;

    constructor(state: number, callback: Function) {
        this.state = state;
        this.callback = callback;
    }

    public getState(): number {
        return this.state;
    }

    public invoke(prevState: number) {
        this.callback(this.state, prevState);
    }
}

export abstract class StateMachine {

    @enumerable(false)
    private state: number;

    @enumerable(false)
    private stateListeners: StateListener[];

    /**
     * @param {string[]} states
     */
    constructor() {
        Object.keys(this).forEach((state, i) => {
            this[state] = Math.pow(2, i);
            // Object.defineProperty(this, state, {value: Math.pow(2, i), enumerable: true});
        });
    }

    /**
     * Indicates if a given state is active
     * @param state
     * @returns {boolean}
     */
    public is(state) {
        return (state | this.state) === this.state;
    }

    public getState() {
        return this.state;
    }

    /**
     * Creates an event listener for the given state
     * @param state
     * @param callback
     */
    public onState(state, callback) {
        this.stateListeners.push(new StateListener(state, callback));
    }

    public setState(state) {
        const prevState = this.state;
        this.state = state;
        if (prevState !== this.state) {
            this.invokeStateListeners(this.state, prevState);
        }
    }

    public addState(state): void {
        const prevState = this.state;
        this.state |= state;
        if (prevState !== this.state) {
            this.invokeStateListeners(this.state, prevState);
        }
    }

    public reset(): void {
        this.state = 0;
    }

    public removeState(state) {
        const prevState = this.state;
        this.state ^= state;
        if (prevState !== this.state) {
            this.invokeStateListeners(this.state, prevState);
        }
    }

    private invokeStateListeners(state: number, prevState: number) {
        this.stateListeners.forEach((listener) => {
            if ((listener.getState() | state) === state) {
                listener.invoke(prevState);
            }
        });
    }
}
