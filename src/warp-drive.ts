/**
 * Created by Greg on 3/24/2017.
 */

import {LevelSlice, WarpField} from './warp-field';
import {GameState} from './simulation';
import {BinaryNetworkEntity} from './network-index';
import {DataFormat, DriveParams, SliceBar} from 'game-params';
import {bind} from 'bind-decorator';
import {Match} from './match';

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
    private endSliceIndex: number;
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
        this.endSliceIndex = 0;

        this.warpField = null;
        this.fieldValues = null;
        this.state = null;

        this.velocity = 0;
    }

    public load(warpField: WarpField, state: GameState): void {
        this.warpField = warpField;
        this.state = state;
        this.timeStep = warpField.getTimeStep();
        this.fieldValues = warpField.getFieldValues();
        this.sliceIndex = ~~(-DriveParams.LEVEL_BUFFER_START / this.timeStep);
        this.endSliceIndex = this.fieldValues.length + ~~(DriveParams.LEVEL_BUFFER_END / this.timeStep);
    }

    public getSliceIndex() {
        return this.sliceIndex;
    }

    public getWarpField(): WarpField {
        return this.warpField;
    }

    @bind
    public update(dt) {
        if (!this.state.is(GameState.Playing)) {
            return;
        }

        this.sliceElapsed += dt;

        while (this.sliceElapsed > this.timeStep / 1000) {
            this.sliceElapsed -= this.timeStep; // break if timeStep is not set
            this.sliceIndex++;
            this.barOffset = 0;

            const sliceSpeed = this.getSlice(DriveParams.RENDER_OFFSET).getSpeed();
            this.velocity = (SliceBar.scaleZ * sliceSpeed + SliceBar.margin) / this.timeStep;
        }

        this.barOffset -= dt * this.velocity;

        if (this.sliceIndex > this.endSliceIndex) {
            this.state.setState(GameState.LevelComplete);
        }

        this.updateBuffer();
    }

    public getSlice(offset = 0) {
        const index = this.sliceIndex + offset;
        if (index < this.fieldValues.length && index >= 0) {
            return this.fieldValues[index];
        } else {
            return LevelSlice.Empty;
        }
    }
}
