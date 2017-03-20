/**
 * Share client/server data structures
 * Created by Greg on 3/17/2017.
 */

export class Track {
    public static readonly LANE_WIDTH: number = 1.15;
    public static readonly NUM_LANES: number  = 3;
    public static readonly POSITION_X: number = (-Track.NUM_LANES / 2) * Track.LANE_WIDTH;
    public static readonly WIDTH: number      = Track.LANE_WIDTH * Track.NUM_LANES;
}

export enum Direction {
    LEFT = -1,
    NONE = 0,
    RIGHT = 1,
}

export class ShipEngine {
    public static readonly MOVE_SPEED: number = 0.0045;
    public static readonly SNAP_DELTA: number = 0.03; // 3% of lane width
}

export class DataFormat {
    public static readonly SHIP: Map<string, number> = new Map([
        ['timestamp', 36],
        ['positionX', 44],
    ]);
}
