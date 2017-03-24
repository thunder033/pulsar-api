import {NetworkEntity} from './network-index';
/**
 * Created by Greg on 3/24/2017.
 */

class LevelSlice {
    private gems: number[];
    private loudness: number;

    constructor(gems: number[]) {
        this.loudness = 1;
        this.gems = gems;
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

        for (let i = 0; i < length; i++) {
            const gems = new Array(lanes);
            gems.fill(0);
            gems[i % lanes] = 1;
            this.level[i] = new LevelSlice(gems);
        }

        this.timeStep = 500; // ms
        this.duration = length * this.timeStep;
    }

    public getSerializable() {
        return Object.assign(super.getSerializable(), {
            duration: this.duration,
            level: this.level,
            timeStep: this.timeStep,
        });
    }
}
