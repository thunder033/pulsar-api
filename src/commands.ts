/**
 * Created by Greg on 4/5/2017.
 */
import {Ship} from './ship';

export class Command {
    protected timestamp: number;
    protected ship: Ship;

    constructor(params: {ship: Ship, timestamp: number}) {
        this.timestamp = params.timestamp;
        this.ship = params.ship;
    }

    public execute(dt: number) {
        return undefined;
    }
}

export class StrafeCommand extends Command {
    private direction: number;

    constructor(params: {direction: number, ship: Ship, timestamp: number}) {
        super(params);
        this.direction = params.direction;
    }

    public execute(dt: number) {
        this.ship.switchLane(this.direction, Date.now() - this.timestamp);
    }
}
