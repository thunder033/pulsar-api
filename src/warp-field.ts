import {NetworkEntity} from './network-index';
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

export class WarpField extends NetworkEntity {

    private level: LevelSlice[];
    private duration: number;
    private timeStep: number;

    constructor() {
        super(WarpField);
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

    public getSerializable() {
        return Object.assign(super.getSerializable(), {
            duration: this.duration,
            level: this.level,
            timeStep: this.timeStep,
        });
    }
}
