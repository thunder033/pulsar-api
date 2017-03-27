import {ServerComponent, SyncServer} from './sync-server';
import {LevelSlice, WarpField} from './warp-field';
import {GameState} from './simulation';
/**
 * Created by Greg on 3/24/2017.
 */

import {bind} from 'bind-decorator';
class Bar {
    public static readonly scaleX: number = 1.5;
    public static readonly scaleY: number = 1;
    public static readonly scaleZ: number = 0.9;

    // The distance between each bar
    public static readonly margin: number = 0.1;
}

/**
 * Reads and utilizes WarpFields to advance the state of
 * the game
 */
export class WarpDrive {

    private barVisibleCnt: number = 55;
    private barQueue;

    private state: GameState;
    private warpField: WarpField;
    private fieldValues: LevelSlice[];

    private sliceIndex: number;
    private sliceElapsed: number;
    private timeStep: number;
    private barOffset: number;

    constructor() {
        this.sliceElapsed = 0;
        this.sliceIndex = 0;
        this.timeStep = NaN;
        this.barOffset = 0;

        this.barQueue = [];
    }

    public load(warpField: WarpField, state: GameState): void {
        this.warpField = warpField;
        this.state = state;
        this.timeStep = warpField.getTimeStep();
        this.fieldValues = warpField.getFieldValues();
    }

    public getWarpField(): WarpField {
        return this.warpField;
    }

    @bind
    public update(dt) {
        if (!this.state.is(this.state.Playing)) {
            return;
        }

        this.sliceElapsed += dt;

        while (this.sliceElapsed > this.timeStep / 1000) {
            this.sliceElapsed -= this.timeStep; // break if timeStep is not set
            this.sliceIndex++;
            this.barOffset = 0;

            this.barQueue.shift();

            while (this.barQueue.length < this.barVisibleCnt) {
                this.barQueue.push({speed: 0.95});
            }
        }

        const velocity = (Bar.scaleZ * this.barQueue[2].speed + Bar.margin) / this.timeStep;
        this.barOffset -= dt * velocity;

        if (this.sliceIndex > this.fieldValues.length) {
            this.state.setState(this.state.LevelComplete);
        }
    }

}
