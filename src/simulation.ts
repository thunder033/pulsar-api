import {ServerComponent, SyncServer} from './sync-server';
import {UserComponent} from './user';
import {NetworkEntity} from './network-index';
import {GameEvent} from './event-types';
import {Enum} from './enum';
import {PriorityQueue} from './priority-queue';
import Timer = NodeJS.Timer;
/**
 * Created by gjrwcs on 3/8/2017.
 */

export class Ship extends NetworkEntity {

    private position: number;

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

    constructor(params: {ship: Ship}) {
        this.ship = params.ship;
    }

    public execute(timestamp: number) {
        this.timestamp = timestamp;
        return undefined;
    }
}

class StrafeCommand extends Command {
    private units: number;

    constructor(params: {units: number, ship: Ship}) {
        super(params);
        this.units = params.units;
    }

    public execute(timestamp: number) {
        super.execute(timestamp);
        this.ship.accelerate(this.units);
    }
}

export class ShipControl extends UserComponent {
    private ship: Ship;
    private commandQueue: PriorityQueue;

    public onInit() {
        this.socket.on(GameEvent.command, (data) => this.queueCommand(data));
        this.server.getComponent(Simulation).schedule(this.update.bind(this));
        this.ship = new Ship();
    }

    private update(dt: number): void {
        while (this.commandQueue.peek() !== null) {
            (this.commandQueue.dequeue() as Command).execute(dt);
        }
    }

    private queueCommand(data) {
        const cmd = new StrafeCommand({units: data, ship: this.ship});
        this.commandQueue.enqueue(data.timestamp, cmd);
    }
}

type SimulationOperation = (dt: number) => void;

export class Simulation extends ServerComponent {

    private targetFPS: number;
    private operations: PriorityQueue;

    private stepInterval: Timer;
    private lastStepTime: number;

    constructor(syncServer: SyncServer) {
        super(syncServer, [ShipControl]);

        this.operations = new PriorityQueue();
    }

    public schedule(operation: SimulationOperation) {
        this.operations.enqueue(0, operation);
    }

    protected step() {
        const dt = performance.now() - this.lastStepTime;
        const it = this.operations.getIterator();

        while (!it.isEnd()) {
            (it.next() as SimulationOperation).call(null, ~~dt);
        }
    }

    protected start() {
        this.lastStepTime = performance.now();
        this.stepInterval = setInterval(() => this.step(), 1000 / this.targetFPS);
    }
}
