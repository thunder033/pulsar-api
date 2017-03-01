'use strict';
/**
 * Created by gjr8050 on 2/23/2017.
 */

import * as uuid from 'uuid/v4';
import {IOEvent} from './event-types';
import {isNullOrUndefined} from 'util';
import Socket = SocketIO.Socket;
import {SyncServer} from './sync-server';
import {Component, Composite} from './component';

export interface INetworkEntity {
    /**
     * Returns a serializable copy of the data on an entity
     */
    getSerializable(): Object;

    getId(): string;

    sync(socket?: Socket, reqId?: string): void;
}

class Network {
    public static syncServer: SyncServer;

    public static entities: Map<string, Map<string, INetworkEntity>>;
}

export class NetworkEntity implements INetworkEntity {

    protected id: string;

    public static init(syncServer: SyncServer): void {
        Network.syncServer = syncServer;
    }

    constructor() {
        this.id = uuid();
    }

    public getId(): string {
        return this.id;
    }

    public sync(socket?: Socket, reqId?: string) {
        const syncResponse = {
            id: this.id,
            params: this.getSerializable(),
            type: this.constructor.name,
        };

        if (!isNullOrUndefined(socket)) {
            const eventName: string = typeof reqId === 'string' ? `${IOEvent.syncNetworkEntity}-${reqId}` : IOEvent.syncNetworkEntity;
            socket.emit(eventName, syncResponse);
        } else {
            Network.syncServer.broadcast(IOEvent.syncNetworkEntity, syncResponse);
        }
    }

    public getSerializable(): Object {
        return {id: this.id};
    }
}

export class Networkable extends Component {

    protected id: string;
    protected parent: Composite & INetworkEntity;

    constructor(parent: Composite & INetworkEntity) {
        super(parent);
        this.id = uuid();
    }

    public getId(): string {
        return this.id;
    }

    public sync(socket?: Socket, reqId?: string) {
        const params = Object.assign(this.parent.getSerializable(), {id: this.id});
        const syncResponse = {
            id: this.id,
            params,
            type: this.constructor.name,
        };

        if (!isNullOrUndefined(socket)) {
            const eventName: string = typeof reqId === 'string' ? `${IOEvent.syncNetworkEntity}-${reqId}` : IOEvent.syncNetworkEntity;
            socket.emit(eventName, syncResponse);
        } else {
            Network.syncServer.broadcast(IOEvent.syncNetworkEntity, syncResponse);
        }
    }
}
