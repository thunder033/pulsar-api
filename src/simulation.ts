/**
 * Created by gjrwcs on 3/8/2017.
 */

import {ServerComponent, SyncServer} from './sync-server';
import {Client, ClientComponent} from './client';
import {NetworkEntity} from './network-index';
import {GameEvent} from './event-types';
import {PriorityQueue} from './priority-queue';
import Timer = NodeJS.Timer;
import {Connection} from './connection';
import {Match} from './match';
import {Ship} from './ship';
import {Clock} from './clock';
import {DataFormat} from './game-params';

enum Method {
    accelerate,
    strafe,
}

class Command {
    protected instruction: Method;
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

class StrafeCommand extends Command {
    private direction: number;

    constructor(params: {direction: number, ship: Ship, timestamp: number}) {
        super(params);
        this.direction = params.direction;
    }

    public execute(dt: number) {
        this.ship.switchLane(this.direction, Date.now() - this.timestamp);
    }
}

export class ShipControl extends ClientComponent {
    private ship: Ship;
    private commandQueue: PriorityQueue;
    private connection: Connection;
    private match: Match;
    private simulation: Simulation;

    private readonly SYNC_INTERVAL: number = 50;
    private syncElapsed: number = 0;

    public onInit() {
        this.connection = this.user.getComponent(Connection);
        this.commandQueue = new PriorityQueue();
    }

    public attachMatch(match: Match): void {
        this.match = match;
        this.socket.on(GameEvent.command, (data) => this.queueCommand(data));
        const simulation = this.server.getComponent(Simulator).getSimulation(this.match);
        simulation.schedule(this.update.bind(this));

        this.ship = new Ship();
        simulation.schedule(this.ship.update.bind(this.ship));
        simulation.schedule(this.syncClients.bind(this), 10);
        this.simulation = simulation;

        this.syncElapsed = 0;
    }

    public getShip(): Ship {
        return this.ship;
    }

    private update(dt: number): void {
        while (this.commandQueue.peek() !== null) {
            (this.commandQueue.dequeue() as Command).execute(dt);
        }
    }

    private syncClients(dt: number): void {
        this.syncElapsed += dt;
        if (this.syncElapsed < this.SYNC_INTERVAL) {
            return;
        }

        this.syncElapsed = 0;
        const buffer: Buffer = this.ship.getDataBuffer();
        const timestampOffset = DataFormat.SHIP.get('timestamp');
        buffer.writeDoubleBE(this.simulation.getTime(), timestampOffset);
        this.match.broadcast(GameEvent.shipSync, buffer);
    }

    private queueCommand(data) {
        // calculate the timestamp
        const timestamp: number = Date.now() - (this.connection.getPing() || 0);
        const cmd = new StrafeCommand({direction: parseInt(data, 10), ship: this.ship, timestamp});
        this.commandQueue.enqueue(timestamp, cmd);
    }
}

export class Player extends ClientComponent {

    private score: number;
    private match: Match;
    private hue: number;

    public attachMatch(match: Match): void {
        this.match = match;
        this.score = 0;

        const simulation = this.server.getComponent(Simulator).getSimulation(match);
        this.hue = simulation.getNewPlayerHue();
    }
}

type SimulationOperation = (dt: number) => void;

export class Simulator extends ServerComponent {

    private games: Map<string, Simulation>;

    constructor(syncServer: SyncServer) {
        super(syncServer, [ShipControl, Player]);
        this.games = new Map();
    }

    public createSimulation(match: Match): Simulation {
        const game = new Simulation(match);
        this.games.set(match.getId(), game);

        match.getUsers().forEach((user) => {
            user.getComponent(ShipControl).attachMatch(match);
            user.getComponent(Player).attachMatch(match);
        });

        return game;
    }

    public getSimulation(match: Match): Simulation {
        return this.games.get(match.getId());
    }
}

export class Simulation extends NetworkEntity {

    private targetFPS: number;
    private operations: PriorityQueue;

    private stepInterval: Timer;
    private lastStepTime: number;
    private match: Match;
    private clock: Clock;

    private usedHues: number[] = [];

    constructor(match: Match) {
        super(Simulation);
        this.operations = new PriorityQueue();
        this.match = match;
        this.clock = new Clock();
    }

    public getTime(): number {
        return this.clock.now();
    }

    public getSerializable() {
        const makeIdPair = (user: Client) => Buffer.from(user.getId() + user.getComponent(ShipControl).getShip().getId());
        const shipIds = Buffer.concat(this.match.getUsers().map(makeIdPair));
        console.log(shipIds.toString('utf8'));
        return Object.assign(super.getSerializable(), {matchId: this.match.getId(), shipIds});
    }

    public schedule(operation: SimulationOperation, priority?: number) {
        this.operations.enqueue(priority || 0, operation);
    }

    public start() {
        this.lastStepTime = Date.now();
        this.stepInterval = setInterval(() => this.step(), 1000 / this.targetFPS);
    }

    public getNewPlayerHue(): number {
        let hue = 0;
        do {
            hue = ~~(Math.random() * 255);
        } while (this.isUsedHue(hue));

        return hue;
    }

    protected step() {
        const stepTime = Date.now();
        const dt = stepTime - this.lastStepTime;
        this.lastStepTime = stepTime;

        const it = this.operations.getIterator();

        while (!it.isEnd()) {
            (it.next() as SimulationOperation).call(null, dt);
        }
    }

    private isUsedHue(hue: number): boolean {
        const THRESHOLD = 50;
        return this.usedHues.some((usedHue) => {
            return Math.abs(usedHue - hue) < THRESHOLD;
        });
    }
}
