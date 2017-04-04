/**
 * Created by Greg on 3/24/2017.
 */

import {LevelSlice, WarpField} from './warp-field';
import {GameState} from './simulation';
import {BinaryNetworkEntity} from './network-index';
import {DataFormat} from 'pulsar-lib/dist/src/game-params';
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
export class WarpDrive extends BinaryNetworkEntity {

    private static readonly RENDER_OFFSET: number = 2;

    private state: GameState;
    private warpField: WarpField;
    private fieldValues: LevelSlice[];

    private sliceIndex: number;
    private sliceElapsed: number;
    private timeStep: number;
    private barOffset: number;

    private velocity: number;

    // binary getter
    private get stateValue(): number {
        return this.state.getState();
    }

    constructor() {
        super(WarpDrive, DataFormat.WARP_DRIVE);
        this.sliceElapsed = 0;
        this.sliceIndex = 0;
        this.timeStep = NaN;
        this.barOffset = 0;

        this.velocity = 0;
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

            const sliceSpeed = this.getSlice(WarpDrive.RENDER_OFFSET).getSpeed();
            this.velocity = (Bar.scaleZ * sliceSpeed + Bar.margin) / this.timeStep;
        }

        this.barOffset -= dt * this.velocity;

        if (this.sliceIndex > this.fieldValues.length) {
            this.state.setState(this.state.LevelComplete);
        }

        this.updateBuffer();
    }

    private getSlice(offset = 0) {
        if (this.sliceIndex + offset < this.fieldValues.length) {
            return this.fieldValues[this.sliceIndex + offset];
        } else {
            return LevelSlice.Empty;
        }
    }
}
