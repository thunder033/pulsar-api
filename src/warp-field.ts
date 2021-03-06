import {BinaryNetworkEntity, NetworkEntity} from './network-index';
import {DataFormat} from 'pulsar-lib/dist/src/game-params';
/**
 * Created by Greg on 3/24/2017.
 */

export class LevelSlice {
    public static readonly Empty: LevelSlice = new LevelSlice([], 0, 1);

    private gems: Int8Array;
    private loudness: number;
    private speed: number;

    constructor(gems: number[], loudness: number, speed: number) {
        this.loudness = Math.abs(loudness);
        this.gems = new Int8Array(gems);
        this.speed = Math.abs(speed);
    }

    /**
     * Get the speed of the slice
     * @returns {number}
     */
    public getSpeed(): number {
        return this.speed;
    }

    public getGems(): Int8Array {
        return this.gems;
    }
}

export class WarpField extends BinaryNetworkEntity {

    private level: LevelSlice[];
    private duration: number;
    private timeStep: number;
    private sliceIndex: number;
    private syncingSlice: boolean;

    private get gems(): Int8Array {
        return this.level[this.sliceIndex].getGems();
    }

    public static reconstruct(buffer: any): WarpField {
        const warpField = new WarpField();
        warpField.level = [];
        for (let i = 0; i < buffer.level.length; i++) {
            const slice = buffer.level[i];
            warpField.level[i] = new LevelSlice(slice.gems, slice.loudness || 1, slice.speed || 1);
        }

        warpField.timeStep = buffer.timeStep;
        warpField.duration = buffer.duration;
        return warpField;
    }

    constructor() {
        super(WarpField, DataFormat.SLICE_UPDATE);
        this.level = [];

        const lanes = 3;
        const length = 400;

        const DEG_TO_RAD = Math.PI / 180;
        for (let i = 0; i < length; i++) {
            const gems = new Array(lanes);
            gems.fill(0);
            gems[i % lanes] = 1;
            this.level[i] = new LevelSlice(gems, 1 - Math.sin(i * DEG_TO_RAD * 3), 2 - Math.cos(i * DEG_TO_RAD * 3));
        }

        this.timeStep = 300; // ms
        this.duration = length * this.timeStep;
        this.syncingSlice = false;
        this.sliceIndex = 0;
    }

    public syncSlice(sliceIndex: number) {
        this.syncingSlice = true;
        this.sliceIndex = sliceIndex;
        this.updateBuffer();
        this.sync();
        this.syncingSlice = false;
    }

    public getTimeStep(): number {
        return this.timeStep;
    }

    public getFieldValues(): LevelSlice[] {
        return this.level;
    }

    public getSerializable(): Buffer | Object {
        if (this.syncingSlice === true) {
            return super.getSerializable();
        } else {
            return {
                duration: this.duration,
                id: this.getId(),
                level: this.level,
                timeStep: this.timeStep,
            };
        }
    }
}
