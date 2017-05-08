/**
 * Created by Greg on 3/12/2017.
 */

import {BinaryNetworkEntity} from './network-index';
import {DataFormat, Direction, ShipEngine, Track} from 'game-params';
import {bind} from 'bind-decorator';
import {logger} from './logger';
import {IGameComponent} from './simulation';
import {Match} from './match';
import {Component} from './component';
import {ShipControl} from './ship-control';

export class Regulator extends Component implements IGameComponent {

    private ships: Ship[];

    public attachMatch(match: Match): void {
        this.ships = match.getUsers().map((user) => user.getComponent(ShipControl).getShip());
        this.ships.forEach((ship) => ship.addConstraint(this));
    }

    public canMoveTo(ship: Ship, positionX: number) {
        const trackPos = positionX - Track.POSITION_X;
        const lane = ~~(trackPos / Track.LANE_WIDTH);
        return !this.ships.some((s) => s !== ship && lane === s.getLaneFromPos());
    }

    @bind
    public update(deltaTime: number): void {
        // noop
    }

    public getSerializable(): Object {
        return null;
    }
}

export class Ship extends BinaryNetworkEntity {

    // only the x-coordinate is of consequence, so we only care about it
    public positionX: number;
    private velocityX: number;

    private destLane: number;
    private lane: number;
    private constraint: Regulator;

    private activeCmd: number; // the current command the ship is executing
    private lastCmd: number; // the last command given to the ship

    private inactiveElapsed: number;
    private inactiveSnapDuration: number = 100;

    public static isValidDestLane(lane: number): boolean {
        return lane >= -1 && lane <= Track.NUM_LANES;
    }

    constructor(lane: number = 0) {
        super(Ship, DataFormat.SHIP);
        this.activeCmd = Direction.NONE;
        this.lastCmd = Direction.NONE;

        this.destLane = lane;
        this.lane = lane;
        this.positionX = Track.POSITION_X + this.destLane * Track.LANE_WIDTH + Track.LANE_WIDTH / 2;
    }

    public addConstraint(constraint: Regulator) {
        this.constraint = constraint;
    }

    @bind
    public update(dt: number): void {
        // clear out velocity
        this.velocityX = 0;

        // If the ship is out of bounds, move it back to the end of the field
        if (this.isInBounds() === false) {
            this.strafeToNearestLane();
            this.activeCmd = Direction.NONE;
        }

        /**
         * Move the ship if
         *  - there's an active control
         *  - and the control is still pressed
         *  - and the target position in lane bounds
         */
        if (this.activeCmd !== Direction.NONE &&
            this.lastCmd === this.activeCmd &&
            this.isInBounds(this.activeCmd * ShipEngine.MOVE_SPEED * dt)) {

            this.strafe(this.activeCmd);
            // otherwise, if there's a lane switch in progress
        } else if (this.isSwitchingLanes() === true) {
            this.strafe(this.getSwitchDirection());
            if (this.hasReachedLane() === true) {
                const laneCenter = Track.POSITION_X + this.destLane * Track.LANE_WIDTH + Track.LANE_WIDTH / 2;
                // adjust position to center of lane
                if (this.isAtLaneCenter() === true) {
                    this.positionX = laneCenter;
                } else {
                    this.strafeToNearestLane();
                }

                logger.debug(`set ship to ${this.positionX.toFixed(2)}`);
                this.lane = this.destLane;
                this.velocityX = 0;
                this.activeCmd = Direction.NONE;
            }
            // Finally if there was an active command but input has stopped
        } else if ((this.activeCmd !== Direction.NONE ||
            !this.isAtLaneCenter()) &&
            this.inactiveElapsed > this.inactiveSnapDuration) {

            this.strafeToNearestLane();
            this.activeCmd = Direction.NONE;
        }

        if (this.lastCmd === Direction.NONE) {
            this.inactiveElapsed += dt;
        } else {
            this.inactiveElapsed = 0;
        }

        // this currently allows only ship to occupy a lane - hopefully refactor to be less kludgy
        if (this.constraint.canMoveTo(this, this.positionX + this.velocityX * dt)) {
            this.positionX += this.velocityX * dt;
        }

        this.updateBuffer();
    }

    /**
     * Determines if the ship is near the center of its current lane
     * @returns {boolean}
     */
    public isAtLaneCenter() {
        const laneCoord = this.getLaneCoord();
        const minBound = 0.5 - ShipEngine.SNAP_DELTA;
        const maxBound = 0.5 + ShipEngine.SNAP_DELTA;
        return laneCoord > minBound && laneCoord < maxBound;
    }

    /**
     * Determine which lane the ship is nearest to, and begin moving towards it
     */
    public strafeToNearestLane() {
        // "snaps" the ship to the middle of the lane when the user releases all controls
        const lane = this.getLaneFromPos();

        // Determine if the ship is closer to the left or to the right
        // Then set the destination and current lanes accordingly
        const snapDirection = this.getLaneCoord() >= 0.5 ? -1 : 1;
        this.lane = lane - snapDirection;
        this.destLane = lane;

        // Conditionally clamp the destination and start lanes
        // This might be the source of the weird "snapping" as some points?
        if (this.destLane >= Track.NUM_LANES) {
            this.destLane = Track.NUM_LANES - 1;
            this.lane = Track.NUM_LANES;
        } else if (this.destLane < 0) {
            this.destLane = 0;
            this.lane = -1;
        }

        this.strafe(this.getSwitchDirection());
    }

    /**
     * commands the ship to begin moving in the given direction
     * @param direction {number}: the Direction to move in
     * @param pingDelay {number}: how many ms ago the client issued the command
     */
    public switchLane(direction: Direction, pingDelay: number = 0): void {
        if (direction !== Direction.NONE && direction !== this.lastCmd) {
            this.lastCmd = direction;

            if (Ship.isValidDestLane(this.destLane + direction)) {
                this.activeCmd = direction;
                if (this.constraint.canMoveTo(this, this.positionX + pingDelay * ShipEngine.MOVE_SPEED)) {
                    this.positionX += pingDelay * ShipEngine.MOVE_SPEED;
                }

            }
        }

        this.lastCmd = direction;
    }

    /**
     * Sets the velocity for movement and increases the bank angle
     * @param direction {number} sign of direction
     */
    public strafe(direction: Direction): void {
        this.velocityX = ShipEngine.MOVE_SPEED * direction;
    }

    /**
     * Determines if the destination position is in lane bounds
     * @param {number} displacement
     * @returns {boolean}
     */
    public isInBounds(displacement: number = 0): boolean {
        const minBound = Track.POSITION_X + Track.LANE_WIDTH / 3;
        const maxBound = Track.POSITION_X + Track.WIDTH - Track.LANE_WIDTH / 3;
        const destPosition = this.positionX + displacement;
        // console.log(`${minBound.toFixed(2)} < ${destPosition.toFixed(2)} < ${maxBound.toFixed(2)}`);
        return destPosition <= maxBound && destPosition >= minBound;
    }

    /**
     * Determines if the ship is switching lanes
     * @returns {boolean}
     */
    public isSwitchingLanes(): boolean {
        return this.lane !== this.destLane;
    }

    /**
     * Gets the direction of lane switch
     * @returns {number}
     */
    public getSwitchDirection(): number {
        return Math.sign(this.destLane - this.lane);
    }

    /**
     * Checks position of the ship to determine if it has reached the destination lane
     * @returns {boolean}
     */
    public hasReachedLane(): boolean {
        const destLaneCenter = Track.POSITION_X + (this.destLane * Track.LANE_WIDTH) + Track.LANE_WIDTH / 2;
        return this.getSwitchDirection() > 0 ? this.positionX >= destLaneCenter : this.positionX <= destLaneCenter;
    }

    /**
     * Calculates how far between the start and dest lanes the ship is
     * @returns {number} 0 to 1
     */
    public getLaneCoord(): number {
        const relPos = (this.positionX - Track.POSITION_X) % Track.LANE_WIDTH;
        return relPos / Track.LANE_WIDTH;
    }

    public setDestLane(lane: number): void {
        this.destLane = Math.min(Math.max(lane, -1), Track.NUM_LANES);
    }

    public getLaneFromPos(): number {
        if (this.positionX < Track.POSITION_X) {
            return -1;
        }

        const trackPos = this.positionX - Track.POSITION_X;
        return ~~(trackPos / Track.LANE_WIDTH);
    }
}
