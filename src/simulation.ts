import {ServerComponent, SyncServer} from './sync-server';
import {UserComponent} from './user';
import {NetworkEntity} from './network-index';
/**
 * Created by gjrwcs on 3/8/2017.
 */

export class Ship extends NetworkEntity {

}

export class ShipControl extends UserComponent {
    private ship: Ship;

    public onInit() {
        // stuff
    }
}

export class Simulation extends ServerComponent {

    constructor(syncServer: SyncServer) {
        super(syncServer, [ShipControl]);
    }
}
