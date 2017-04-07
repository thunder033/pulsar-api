import {BinaryNetworkEntity, NetworkEntity} from './network-index';
import {DataFormat} from 'pulsar-lib/dist/src/game-params';
/**
 * Created by Greg on 3/24/2017.
 */

export class LevelSlice {
    public static readonly Empty: LevelSlice = new LevelSlice([], 0, 1);

    private gems: number[];
    private loudness: number;
    private speed: number;

    constructor(gems: number[], loudness: number, speed: number) {
        this.loudness = Math.abs(loudness);
        this.gems = gems;
        this.speed = Math.abs(speed);
    }

    /**
     * Get the speed of the slice
     * @returns {number}
     */
    public getSpeed(): number {
        return this.speed;
    }

    public getGems(): number[] {
        return this.gems;
    }
}

export class WarpField extends BinaryNetworkEntity {

    private level: LevelSlice[];
    private duration: number;
    private timeStep: number;
    private sliceIndex: number;
    private syncingSlice: boolean;

    private get gems(): number[] {
        return this.level[this.sliceIndex].getGems();
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

        console.log(this.level.length);
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

    public reconstruct(buffer: Buffer) {
        throw new Error('not implemented');
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
