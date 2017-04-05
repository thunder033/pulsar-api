/**
 * Created by Greg on 3/24/2017.
 */

import {LevelSlice, WarpField} from './warp-field';
import {GameState} from './simulation';
import {BinaryNetworkEntity} from './network-index';
import {DataFormat, DriveParams, SliceBar} from 'game-params';
import {bind} from 'bind-decorator';

/**
 * Reads and utilizes WarpFields to advance the state of
 * the game
 */
export class WarpDrive extends BinaryNetworkEntity {
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

            const sliceSpeed = this.getSlice(DriveParams.RENDER_OFFSER).getSpeed();
            this.velocity = (SliceBar.scaleZ * sliceSpeed + SliceBar.margin) / this.timeStep;
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
