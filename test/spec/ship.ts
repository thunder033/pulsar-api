/**
 * Created by Greg on 3/11/2017.
 */

import { only, skip, slow, suite, test, timeout } from 'mocha-typescript';
import { expect } from 'chai';
import {Ship} from '../../src/ship';
import {Direction, Track} from '../../src/game-params';
import {NetworkIndex} from '../../src/network-index';
import {SyncServer} from '../../src/sync-server';
import {ExpressServer} from '../../src/express-server';

function pluck<T, K extends keyof T>(obj: T, prop: K): T[K] {
    return obj[prop];
}

@suite class ShipSpec {

    ship: Ship;
    moveOffset: number = 0.1;

    static before() {
        // init the application
        const httpServer = new ExpressServer({});
        // Create a new sync server
        const syncServer = new SyncServer(httpServer.getServer());
        // Add Components that define server functionality
        syncServer.addComponent(NetworkIndex);
    }

    before() {
        this.ship = new Ship();
    }

    @test 'Can instantiate a Ship'() {
        const ship = new Ship();
        expect(ship).to.be.instanceof(Ship);
    }

    @test 'Calculates in bounds at center'() {
        this.ship.positionX = Track.POSITION_X + Track.WIDTH / 2;
        expect(this.ship.isInBounds()).to.be.true;
    }

    @test 'Calculates out of bounds at left edge'() {
        this.ship.positionX = Track.POSITION_X;
        expect(this.ship.isInBounds()).to.be.true;
    }

    @test 'Calculates out of bounds beyond left edge'() {
        this.ship.positionX = Track.POSITION_X - this.moveOffset;
        expect(this.ship.isInBounds()).to.be.false;
    }

    @test 'Calculates in bounds beyond left edge, moving right'() {
        this.ship.positionX = Track.POSITION_X - this.moveOffset;
        expect(this.ship.isInBounds(this.moveOffset)).to.be.true;
    }

    @test 'Calculates out of bounds beyond right edge'() {
        this.ship.positionX = Track.POSITION_X + Track.WIDTH + this.moveOffset;
        expect(this.ship.isInBounds()).to.be.false;
    }

    @test 'Calculates in bounds beyond right, moving left'() {
        this.ship.positionX = Track.POSITION_X + Track.WIDTH + this.moveOffset;
        expect(this.ship.isInBounds(-this.moveOffset)).to.be.true;
    }

    @test 'Indicates switching lanes'() {
        expect(this.ship.isSwitchingLanes()).to.be.false;
        this.ship['lane'] = 1; // tslint:disable-line
        this.ship.switchLane(Direction.LEFT);
        expect(this.ship.isSwitchingLanes()).to.be.true;
    }

    @test 'Gets the direction of the current lane switch'() {
        this.ship['lane'] = 2; // tslint:disable-line
        this.ship['destLane'] = 2; // tslint:disable-line
        expect(this.ship.getSwitchDirection()).to.equal(Direction.NONE);
        this.ship.switchLane(Direction.LEFT);
        expect(this.ship.getSwitchDirection()).to.equal(Direction.LEFT);
        this.ship.switchLane(Direction.RIGHT);
        expect(this.ship.getSwitchDirection()).to.equal(Direction.NONE);
    }

    @test 'Gets switch direction across multiple lanes'() {
        this.ship['lane'] = 2; // tslint:disable-line
        this.ship['destLane'] = 0; // tslint:disable-line
        expect(this.ship.getSwitchDirection()).to.equal(Direction.LEFT);
    }

    @test 'Indicates if the ship has reached the lane it is traveling to'() {
        this.ship['lane'] = 1; // tslint:disable-line
        this.ship['destLane'] = 2; // tslint:disable-line
        // at near edge (from source) of lane: false
        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH;
        expect(this.ship.hasReachedLane(), 'near edge').to.be.false;

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH * 2 + Track.LANE_WIDTH / 5;
        expect(this.ship.hasReachedLane(), 'near quarter').to.be.false;

        // at center of lane: true
        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH * 2 + Track.LANE_WIDTH / 2;
        expect(this.ship.hasReachedLane(), 'center').to.be.true;

        // beyond center of lane: true
        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH * 2 + Track.LANE_WIDTH;
        expect(this.ship.hasReachedLane(), 'far edge').to.be.true;

        this.ship['lane'] = 1; // tslint:disable-line
        this.ship['destLane'] = 0; // tslint:disable-line

        this.ship.positionX = Track.POSITION_X;
        expect(this.ship.hasReachedLane(), 'left lane, left edge').to.be.true;

        this.ship.positionX = Track.POSITION_X - Track.LANE_WIDTH / 100;
        expect(this.ship.hasReachedLane(), 'beyond left bound, move left').to.be.true;

        this.ship['lane'] = -1; // tslint:disable-line
        this.ship['destLane'] = 0; // tslint:disable-line

        this.ship.positionX = Track.POSITION_X - Track.LANE_WIDTH / 2;
        expect(this.ship.hasReachedLane(), 'beyond left bound, move right').to.be.false;
    }

    @test 'gets the relative position of the lane it\'s in'() {
        if (Track.POSITION_X > 0) {
            console.warn('Track Offset is not negative, these test may accurately test behavior');
        }

        const delta = 0.02;
        this.ship.positionX = Track.POSITION_X;
        expect(this.ship.getLaneCoord(), 'left edge, negative').to.equal(0);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH / 2;
        expect(this.ship.getLaneCoord(), 'center lane,  negative').to.be.approximately(0.5, delta);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH - Track.LANE_WIDTH / 100;
        expect(this.ship.getLaneCoord(), 'right edge, negative').to.be.approximately(1, delta);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH;
        expect(this.ship.getLaneCoord(), 'next lane, left edge').to.equal(0);

        const rightTrackEdge = Track.POSITION_X + Track.WIDTH;
        this.ship.positionX = rightTrackEdge;
        expect(this.ship.getLaneCoord(), 'next lane, right edge').to.equal(0);

        this.ship.positionX = rightTrackEdge - Track.LANE_WIDTH;
        expect(this.ship.getLaneCoord(), 'left edge, positive').to.equal(0);

        this.ship.positionX = rightTrackEdge - Track.LANE_WIDTH / 2;
        expect(this.ship.getLaneCoord(), 'center lane, positive').to.be.approximately(0.5, delta);

        this.ship.positionX = rightTrackEdge - Track.LANE_WIDTH / 100;
        expect(this.ship.getLaneCoord(), 'right edge, positive').to.be.approximately(1, delta);
    }

    @test 'gets lane based on position'() {
        this.ship.positionX = Track.POSITION_X - Track.LANE_WIDTH / 2;
        expect(this.ship.getLaneFromPos(), 'beyond left edge').to.equal(-1);

        this.ship.positionX = Track.POSITION_X;
        expect(this.ship.getLaneFromPos(), 'left edge, lane 0').to.equal(0);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH / 2;
        expect(this.ship.getLaneFromPos(), 'center, lane 0').to.equal(0);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH;
        expect(this.ship.getLaneFromPos(), 'left edge, lane 1').to.equal(1);

        this.ship.positionX = Track.POSITION_X + Track.WIDTH - Track.LANE_WIDTH / 100;
        expect(this.ship.getLaneFromPos(), 'right edge, right lane').to.equal(Track.NUM_LANES - 1);

        this.ship.positionX = Track.POSITION_X + Track.WIDTH;
        expect(this.ship.getLaneFromPos(), 'left edge, outside right bound').to.equal(Track.NUM_LANES);
    }

    @test 'sets nearest valid destination lane'() {
        this.ship.positionX = Track.POSITION_X - Track.LANE_WIDTH / 2;
        this.ship.strafeToNearestLane();
        expect(this.ship['destLane'], 'dest lane, beyond left bound').equal(0); // tslint:disable-line
        expect(this.ship['lane'], 'lane, beyond left bound').equal(-1); // tslint:disable-line
        expect(this.ship.getSwitchDirection()).to.equal(Direction.RIGHT);

        this.ship.positionX = Track.POSITION_X + Track.LANE_WIDTH + Track.LANE_WIDTH / 3;
        this.ship.strafeToNearestLane();
        expect(this.ship['destLane'], 'dest lane, middle lane').equal(1); // tslint:disable-line
        expect(this.ship['lane'], 'lane, middle lane').equal(2); // tslint:disable-line
        expect(this.ship.getSwitchDirection()).to.equal(Direction.LEFT);

        this.ship.positionX = Track.POSITION_X + Track.WIDTH;
        this.ship.strafeToNearestLane();
        expect(this.ship['destLane'], 'dest lane, beyond right bound').equal(Track.NUM_LANES - 1); // tslint:disable-line
        expect(this.ship['lane'], 'lane, beyond right bound').equal(Track.NUM_LANES); // tslint:disable-line
        expect(this.ship.getSwitchDirection()).to.equal(Direction.LEFT);
    }
}
