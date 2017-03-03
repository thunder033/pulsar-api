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

    public onJoin(data) {
        // this.user.setName(data.name);

    }

    public onDisconnect() {
        if (!this.terminated) {
            this.disconnectTimer = setTimeout(() => this.terminate(), Connection.DISCONNECT_TIMEOUT_DURATION);
        }

        // this.user.onDisconnect();
    }

    private syncNetworkEntity(data): void {
        const entity: INetworkEntity = NetworkEntity.getById(NetworkEntity.getType(data.name), data.id);
        this.socket.emit(`${IOEvent.syncNetworkEntity}-${data.reqId}`, new SyncResponse(entity));
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
