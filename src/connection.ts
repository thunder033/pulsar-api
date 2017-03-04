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
        this.socket.on(IOEvent.joinServer, () => {
            this.server.getDefaultRoom().add(this.user);
            this.server.syncClient(this.socket);
            this.user.sync(this.socket);
        });
    }

    public onDisconnect() {
        if (!this.terminated) {
            this.disconnectTimer = setTimeout(() => this.terminate(), Connection.DISCONNECT_TIMEOUT_DURATION);
        }

        // this.user.onDisconnect();
    }

    private syncNetworkEntity(data): void {
        const req = data.body;
        const errorKey = `${IOEvent.serverError}-${data.reqId}`;
        console.log(`${data.reqId}: ${req.type} ${req.id}`);

        if (req.type && req.id) {
            const type = NetworkEntity.getType(req.type);
            if (!type) {
                this.socket.emit(errorKey, `Invalid ${IOEvent.syncNetworkEntity} request type: ${req.type}`);
                return;
            }

            const entity: INetworkEntity = NetworkEntity.getById(type, req.id);
            if (!entity) {
                this.socket.emit(errorKey, `No ${type.name} was found with id ${req.id}`);
                return;
            }

            this.socket.emit(`${IOEvent.syncNetworkEntity}-${data.reqId}`, new SyncResponse(entity));
        } else {
            this.socket.emit(errorKey, `Invalid ${IOEvent.syncNetworkEntity} request`);
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
