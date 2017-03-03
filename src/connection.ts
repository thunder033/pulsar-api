/**
 * Created by gjrwcs on 3/1/2017.
 */

import {UserComponent} from './user';
import {IOEvent} from './event-types';
import {INetworkEntity, NetworkEntity, SyncResponse} from './network-entity';
import Timer = NodeJS.Timer;

export class Connection extends UserComponent {

    // We need more server functionality to support re-connection
    public static DISCONNECT_TIMEOUT_DURATION: number = 0;

    protected disconnectTimer: Timer = null;
    private terminated: boolean = false;

    public onInit() {
        this.socket.on(IOEvent.syncNetworkEntity, this.syncNetworkEntity.bind(this));
    }

    public onDisconnect() {
        if (!this.terminated) {
            this.disconnectTimer = setTimeout(() => this.terminate(), Connection.DISCONNECT_TIMEOUT_DURATION);
        }

        // this.user.onDisconnect();
    }

    private syncNetworkEntity(data): void {
        const req = data.body;
        console.log(`${data.reqId}: ${req.type} ${req.id}`);

        if (req.type && req.id) {
            const type = NetworkEntity.getType(req.type);
            const entity: INetworkEntity = NetworkEntity.getById(type, req.id);
            this.socket.emit(`${IOEvent.syncNetworkEntity}-${data.reqId}`, new SyncResponse(entity));
        } else {
            this.socket.emit(IOEvent.serverError, `Invalid ${IOEvent.syncNetworkEntity} request`);
        }

    }

    private terminate() {
        this.terminated = true;

        console.log(`terminate session for ${this.user.getName()}`);
        this.terminated = true;

        if (!this.server.removeUser(this.user)) {
            console.warn(`Failed to remove user [${this.user.getName()}] from the server`);
        }
    }
}
