import {ServerComponent, SyncServer} from './sync-server';
import {UserComponent} from './user';
import {NetworkEntity} from './network-index';
import {GameEvent} from './event-types';
import {Enum} from './enum';
/**
 * Created by gjrwcs on 3/8/2017.
 */

export class Ship extends NetworkEntity {

    constructor() {

        super(Ship);
    }

    public accelerate(units: number): void {

    }

    public strafe(unit: number): void {

    }
}

enum Method {
    accelerate,
    strafe,
}

class Command {
    protected instruction: Method;
    protected timestamp: number;
    protected ship: Ship;

    protected execute(timestamp: number) {
        this.timestamp = timestamp;
        return undefined;
    }
}

class AccelerateCommand extends Command {
    private units: number;

    protected execute(timestamp: number) {
        this.ship.accelerate(this.units);
    }
}

export class ShipControl extends UserComponent {
    private ship: Ship;

    public onInit() {
        this.socket.on(GameEvent.command, (data) => this.dispatchCommand(data));
    }

    dispatchCommand(data) {

    }
}

export class Simulation extends ServerComponent {

    constructor(syncServer: SyncServer) {
        super(syncServer, [ShipControl]);
    }
}
