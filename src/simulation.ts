/**
 * Created by gjrwcs on 3/8/2017.
 */

import {ServerComponent, SyncServer} from './sync-server';
import {User, UserComponent} from './user';
import {NetworkEntity} from './network-index';
import {GameEvent} from './event-types';
import {PriorityQueue} from './priority-queue';
import Timer = NodeJS.Timer;
import {Connection} from './connection';
import {Match} from './match';

class Lane {
    public static readonly WIDTH: number = 1.15;
    public static readonly MAX_LANE: number = 2;
}

enum Direction {
    LEFT = -1,
    NONE = 0,
    RIGHT = 1,
}

export class Ship extends NetworkEntity {

    private static readonly MOVE_SPEED: number = 0.0045;

    // only the x-coordinate is of consequence, so we only care about it
    private velocityX: number;
    private positionX: number;

    private destLane: number;
    private lane: number;

    private activeCmd: number; // the current command the ship is executing
    private lastCmd: number; // the last command given to the ship

    private positionBuffer: ArrayBuffer;
    private positionView: DataView;

    private updateBuffer: Buffer;

    constructor() {
        super(Ship);
        this.activeCmd = Direction.NONE;
        this.lastCmd = Direction.NONE;

        this.positionBuffer = new ArrayBuffer(8);
        this.positionView = new DataView(this.positionBuffer);

        this.updateBuffer = Buffer.alloc(NetworkEntity.ID_LENGTH + 8);
        this.updateBuffer.write(this.getId(), 0);

        this.positionX = 0;
        this.destLane = 0;
        this.lane = 0;
    }

    public update(dt: number): void {
        // clear out velocity
        this.velocityX = 0;

        // If the ship is out of bounds, move it back to the end of the field
        if (this.isInBounds(0) === false) {
            this.positionX -= this.positionX - Math.sign(this.positionX) * Lane.WIDTH;
        }

        /**
         * Move the ship if
         *  - there's an active control
         *  - and the control is still pressed
         *  - and the target position in lane bounds - FIXME: this might be coded wrong
         */
        if (this.activeCmd !== Direction.NONE &&
            this.lastCmd === this.activeCmd &&
            this.isInBounds(Ship.MOVE_SPEED * dt)) {

            this.strafe(this.activeCmd);
            // otherwise, if there's a lane switch in progress
        } else if (this.isSwitchingLanes() === true) {
            this.strafe(this.getSwitchDirection());
            if (this.hasReachedLane() === true) {
                this.positionX = (this.destLane - 1) * Lane.WIDTH; // adjust position to center of lane
                this.lane = this.destLane;
                this.velocityX = 0;
                this.activeCmd = Direction.NONE;
            }
            // Finally if there was an active command but input has stopped
        } else if (this.activeCmd !== Direction.NONE) {
            // "snaps" the ship to the middle of the lane when the user releases all controls
            // FIXME: this implementation is known to be glitchy
            let rightBound = 0; // figure out which lane the ship is to the left of
            while ((rightBound - 1) * Lane.WIDTH <= this.positionX) {
                rightBound++;
            }

            // Determine if the ship is closer to the left or to the right
            // Then set the destination and current lanes accordingly
            const snapDirection = Math.round(this.getLaneCoord());
            this.destLane = rightBound - (1 - snapDirection);
            this.lane = rightBound - snapDirection;

            // Conditionally clamp the destination and start lanes
            // This might be the source of the weird "snapping" as some points?
            if (this.destLane > Lane.MAX_LANE) {
                this.destLane = Lane.MAX_LANE;
                this.lane = Lane.MAX_LANE - 1;
            } else if (this.destLane < 0) {
                this.destLane = 0;
                this.lane = 1;
            }

            this.activeCmd = Direction.NONE;
        }

        this.positionX += this.velocityX * dt;

        this.updateBuffer.writeDoubleBE((this.positionX || 0), NetworkEntity.ID_LENGTH);
        this.positionView.setFloat64(0, this.positionX);
    }

    public getDataBuffer(): Buffer {
        return this.updateBuffer;
    };

    public switchLane(direction: Direction): void {
        if (direction !== Direction.NONE && direction !== this.lastCmd) {
            this.activeCmd = direction;
            this.lastCmd = direction;
            this.setDestLane(this.destLane + direction);
        }

        this.lastCmd = direction;
    }

    /**
     * Sets the velocity for movement and increases the bank angle
     * @param direction {number} sign of direction
     */
    public strafe(direction: Direction): void {
        this.velocityX = Ship.MOVE_SPEED * direction;
    }

    /**
     * Determines if the destination position is in lane bounds
     * @param {number} moveDistance
     * @returns {boolean}
     */
    private isInBounds(moveDistance: number): boolean {
        const minBound = -Lane.WIDTH - moveDistance;
        const maxBound = +Lane.WIDTH + moveDistance;
        return this.positionX <= maxBound && this.positionX >= minBound;
    }

    /**
     * Determines if the ship is switching lanes
     * @returns {boolean}
     */
    private isSwitchingLanes(): boolean {
        return this.lane !== this.destLane;
    }

    /**
     * Gets the direction of lane switch
     * @returns {number}
     */
    private getSwitchDirection(): number {
        return Math.sign(this.destLane - this.lane);
    }

    /**
     * Checks position of the ship to determine if it has reached the destination lane
     * @returns {boolean}
     */
    private hasReachedLane(): boolean {
        const lanePos = (this.destLane - 1) * Lane.WIDTH;
        return this.getSwitchDirection() > 0 ? this.positionX >= lanePos : this.positionX <= lanePos;
    }

    /**
     * Calculates how far between the start and dest lanes the ship is
     * @returns {number} 0 to 1
     */
    private getLaneCoord(): number {
        const relPos = (this.positionX + Lane.WIDTH) % Lane.WIDTH;
        return relPos / Lane.WIDTH;
    }

    private setDestLane(lane: number): void {
        this.destLane = Math.min(Math.max(lane, 0), Lane.MAX_LANE);
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

    constructor(params: {ship: Ship, timestamp: number}) {
        this.timestamp = params.timestamp;
        this.ship = params.ship;
    }

    public execute(timestamp: number) {
        this.timestamp = timestamp;
        return undefined;
    }
}

class StrafeCommand extends Command {
    private direction: number;

    constructor(params: {direction: number, ship: Ship, timestamp: number}) {
        super(params);
        this.direction = params.direction;
    }

    public execute(timestamp: number) {
        super.execute(timestamp);
        this.ship.switchLane(this.direction);
    }
}

export class ShipControl extends UserComponent {
    private ship: Ship;
    private commandQueue: PriorityQueue;
    private connection: Connection;
    private match: Match;

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
        this.match.broadcast(GameEvent.shipSync, this.ship.getDataBuffer());
    }

    private queueCommand(data) {
        // calculate the timestamp
        const timestamp: number = Date.now() - (this.connection.getPing() || 0);
        const cmd = new StrafeCommand({direction: parseInt(data, 10), ship: this.ship, timestamp});
        this.commandQueue.enqueue(timestamp, cmd);
    }
}

export class Player extends UserComponent {

    private score: number;
    private match: Match;

    public attachMatch(match: Match): void {
        this.match = match;
        this.score = 0;
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

    constructor(match: Match) {
        super(Simulation);
        this.operations = new PriorityQueue();
        this.match = match;
    }

    public getSerializable() {
        const makeIdPair = (user: User) => Buffer.from(user.getId() + user.getComponent(ShipControl).getShip().getId());
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

    protected step() {
        const stepTime = Date.now();
        const dt = stepTime - this.lastStepTime;
        this.lastStepTime = stepTime;

        const it = this.operations.getIterator();

        while (!it.isEnd()) {
            (it.next() as SimulationOperation).call(null, dt);
        }
    }
}
