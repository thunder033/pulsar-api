/**
 * Created by gjrwcs on 3/8/2017.
 */

import {ServerComponent, SyncServer} from './sync-server';
import {UserComponent} from './user';
import {NetworkEntity} from './network-index';
import {GameEvent} from './event-types';
import {PriorityQueue} from './priority-queue';
import Timer = NodeJS.Timer;
import {Connection} from './connection';

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

    private activeCmd: number; // the last command given to the ship
    private curFrameCmd: number; // a command sent since the last frame

    constructor() {
        super(Ship);
        this.activeCmd = Direction.NONE;
        this.curFrameCmd = Direction.NONE;
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
            this.curFrameCmd !== Direction.NONE &&
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
        } else if (this.activeCmd !== 0) {
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

        this.activeCmd = this.curFrameCmd;
        this.curFrameCmd = Direction.NONE;
    }

    public switchLane(direction: Direction): void {
        this.curFrameCmd = direction;
        this.setDestLane(this.destLane + direction);
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
        return this.positionX <= maxBound && this.positionX > minBound;
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
        this.ship.strafe(this.direction);
    }
}

export class ShipControl extends UserComponent {
    private ship: Ship;
    private commandQueue: PriorityQueue;
    private connection: Connection;

    public onInit() {
        this.socket.on(GameEvent.command, (data) => this.queueCommand(data));
        const simulation = this.server.getComponent(Simulation);
        simulation.schedule(this.update.bind(this));

        this.ship = new Ship();
        simulation.schedule(this.ship.update.bind(this.ship));

        this.connection = this.user.getComponent(Connection);
    }

    private update(dt: number): void {
        while (this.commandQueue.peek() !== null) {
            (this.commandQueue.dequeue() as Command).execute(dt);
        }
    }

    private queueCommand(data) {
        // calculate the timestamp
        const timestamp: number = Date.now() - (this.connection.getPing() || 0);
        const cmd = new StrafeCommand({direction: parseInt(data, 10), ship: this.ship, timestamp});
        this.commandQueue.enqueue(timestamp, cmd);
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
