/**
 * Created by gjrwcs on 3/1/2017.
 */

import {UserComponent} from './user';
import {IOEvent} from './event-types';
import {INetworkEntity, NetworkEntity, SyncResponse} from './network-entity';
import Timer = NodeJS.Timer;

/**
 * Maintains the connect for a single client
 */
export class Connection extends UserComponent {

    // We need more server functionality to support re-connection
    public static DISCONNECT_TIMEOUT_DURATION: number = 0;

    // the connection will terminate when this timer expires
    protected disconnectTimer: Timer = null;
    // indicates if the connection has been terminated
    private terminated: boolean = false;

    public onInit() {
        // Handle requests from the client for data synchronization
        this.socket.on(IOEvent.syncNetworkEntity, this.syncNetworkEntity.bind(this));
        // Setup the connection when the client request to join
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

    /**
     * Respond to request to sync a network entity
     * @param data
     */
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
        console.log(`terminate session for ${this.user.getName()}`);
        this.terminated = true;

        if (!this.server.removeClient(this.user)) {
            console.warn(`Failed to remove user [${this.user.getName()}] from the server`);
        }
    }
}
