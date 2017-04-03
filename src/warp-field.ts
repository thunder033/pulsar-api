import {NetworkEntity} from './network-index';
/**
 * Created by Greg on 3/24/2017.
 */

export class LevelSlice {
    private gems: number[];
    private loudness: number;
    private speed: number;

    constructor(gems: number[], loudness: number, speed: number) {
        this.loudness = loudness;
        this.gems = gems;
        this.speed = speed;
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
        const length = 250;

        const DEG_TO_RAD = Math.PI / 180;
        for (let i = 0; i < length; i++) {
            const gems = new Array(lanes);
            gems.fill(0);
            gems[i % lanes] = 1;
            this.level[i] = new LevelSlice(gems, Math.sin(i * DEG_TO_RAD), Math.cos(i * DEG_TO_RAD));
        }

        this.timeStep = 500; // ms
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
