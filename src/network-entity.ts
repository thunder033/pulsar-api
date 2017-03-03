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

    sync(socket?: Socket): void;
}

interface INetworkEntityCtor {
    new(...args: any[]): INetworkEntity;
}

class Network {
    public static syncServer: SyncServer;
    public static types: Map<string, INetworkEntityCtor> = new Map();
    public static entities: Map<string, Map<string, INetworkEntity>> = new Map();
}

export class SyncResponse {
    public id: string;
    public params: Object;
    public type: string;

    constructor(entity: INetworkEntity) {
        this.id = entity.getId();
        this.params = entity.getSerializable();
        this.type = entity.constructor.name;
    }
}

export abstract class NetworkEntity implements INetworkEntity {

    protected id: string;

    public static init(syncServer: SyncServer): void {
        Network.syncServer = syncServer;
    }

    public static getType(name: string): INetworkEntityCtor {
        return Network.types.get(name);
    }

    public static getById<T extends INetworkEntity>(type: INetworkEntityCtor, id: string): T {
        if (Network.entities.has(type.name)) {
            return Network.entities.get(type.name).get(id) as T;
        } else {
            let keyType: any = null;
            Network.types.forEach((candidateType) => {
                if (type.prototype instanceof candidateType) {
                    keyType = candidateType;
                }
            });

            if (keyType !== null) {
                return Network.entities.get(keyType.name).get(id) as T;
            } else {
                throw new TypeError(`Could not resolve ${type} to a valid key type`);
            }
        }

    }

    constructor(type: INetworkEntityCtor) {
        this.id = uuid();

        if (!Network.types.has(type.name)) {
            Network.types.set(type.name, type);
            Network.entities.set(type.name, new Map());
        }
    }

    public getId(): string {
        return this.id;
    }

    public sync(socket?: Socket, reqId?: string) {
        if (!isNullOrUndefined(socket)) {
            socket.emit(IOEvent.syncNetworkEntity, new SyncResponse(this));
        } else {
            Network.syncServer.broadcast(IOEvent.syncNetworkEntity, new SyncResponse(this));
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

    public init() {
        console.log(this.id);
    }

    public sync(socket?: Socket) {
        const params = Object.assign(this.parent.getSerializable(), {id: this.id});
        const syncResponse = {
            id: this.id,
            params,
            type: this.constructor.name,
        };

        if (!isNullOrUndefined(socket)) {
            socket.emit(IOEvent.syncNetworkEntity, syncResponse);
        } else {
            Network.syncServer.broadcast(IOEvent.syncNetworkEntity, syncResponse);
        }
    }
}
