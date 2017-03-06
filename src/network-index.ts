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
import {Room} from './room';

export interface INetworkEntity {
    /**
     * Returns a serializable copy of the data on an entity
     */
    getSerializable(): Object;

    getId(): string;

    sync(socket?: Socket): void;
}

/**
 * Constructor that generates a network entity
 */
interface INetworkEntityCtor {
    new(...args: any[]): INetworkEntity;
}

/**
 * Provides arbitrary access to entities that are needed by clients
 */
class NetworkIndex {
    public static syncServer: SyncServer;
    public static types: Map<string, INetworkEntityCtor> = new Map();
    public static entities: Map<string, Map<string, INetworkEntity>> = new Map();
}

/**
 * Represents a response to sync an entity with a client
 */
export class SyncResponse {
    public id: string;
    public params: Object;
    public type: string;

    constructor(entity: INetworkEntity) {
        this.id = entity.getId(); // the client must be able to id the entity
        this.params = entity.getSerializable(); // include serializable fields
        this.type = entity.constructor.name; // the type is present so a client-side instance can be constructed
    }
}

/**
 * Add an entity to the network index
 * @param type: the type of the entity
 * @param entity {INetworkEntity}: the entity to add
 */
function putNetworkEntity(type: INetworkEntityCtor, entity: INetworkEntity): void {
    const keyType: any = resolveNetworkEntityType(type);

    if (keyType === null) {
        throw new TypeError(`Could not resolve ${type} to a valid key type`);
    }

    NetworkIndex.entities.get(keyType.name).set(entity.getId(), entity);
}

/**
 * Attempt to resolve a given type to a base type used in the network index
 * @param type
 * @returns {any}
 */
function resolveNetworkEntityType(type: INetworkEntityCtor): INetworkEntityCtor {
    // If the network type is in the index, we're all good
    if (NetworkIndex.entities.has(type.name)) {
        return type;
    } else {
        // If not, it might be a derived type, so attempt to find a matching base type
        let resolvedType: any = null;
        NetworkIndex.types.forEach((candidateType) => {
            // compare the provided type with with each type in the network index
            if (type.prototype instanceof candidateType) {
                resolvedType = candidateType;
            }
        });

        // If a matching base type isn't found, we just return null
        return resolvedType;
    }
}

export abstract class NetworkEntity implements INetworkEntity {

    protected id: string;

    public static init(syncServer: SyncServer): void {
        NetworkIndex.syncServer = syncServer;
    }

    /**
     * Get the type associated with a given type name
     * @param name
     * @returns {undefined|INetworkEntityCtor}
     */
    public static getType(name: string): INetworkEntityCtor {
        return NetworkIndex.types.get(name);
    }

    public static getById<T extends INetworkEntity>(type: INetworkEntityCtor, id: string): T {
        const keyType: any = resolveNetworkEntityType(type);

        if (keyType === null) {
            throw new TypeError(`Could not resolve ${type} to a valid key type`);
        }

        return NetworkIndex.entities.get(keyType.name).get(id) as T;
    }

    /**
     * Register an entity type in the network entity index
     * @param type
     */
    public static registerType(type: INetworkEntityCtor) {
        if (!NetworkIndex.types.has(type.name)) {
            console.log(`Register type ${type.name}`);
            NetworkIndex.types.set(type.name, type);
            NetworkIndex.entities.set(type.name, new Map());
        }
    }

    constructor(type: INetworkEntityCtor) {
        this.id = uuid();
        NetworkEntity.registerType(type);
        putNetworkEntity(type, this);
    }

    /**
     * Get the entity uuid4-generated id
     * @returns {string}
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Sync this entity with all clients or the client associated with the provided socket
     * @param [socket {Socket}]: a specific socket to sync with
     * @param [roomName {Room}]: the room to sync in
     */
    public sync(socket?: Socket, roomName?: string) {
        if (!isNullOrUndefined(socket)) {
            socket.emit(IOEvent.syncNetworkEntity, new SyncResponse(this));
        } else {
            NetworkIndex.syncServer.broadcast(IOEvent.syncNetworkEntity, new SyncResponse(this), roomName);
        }
    }

    /**
     * Create a JSON-safe representation of this entity
     * @returns {{id: string}}
     */
    public getSerializable(): Object {
        return {id: this.id};
    }
}

/**
 * A component-based implementation of the NetworkEntity where inheritance isn't possible
 */
export class Networkable extends Component {

    protected id: string;
    protected parent: Composite & INetworkEntity;
    protected type: any;

    constructor(parent: Composite & INetworkEntity) {
        super(parent);
        this.id = uuid();

        // The network db needs to any entry of each type of entity
        this.type = Object.getPrototypeOf(parent).constructor;
        NetworkEntity.registerType(this.type);
    }

    /**
     * Returns the unique id for this network entity
     * @returns {string}
     */
    public getId(): string {
        return this.id;
    }

    public init() {
        // this is done in init and not in the ctor so the parent can call methods of this component
        putNetworkEntity(this.type, this.parent);
    }

    /**
     * Pushes data to all clients or the client associated with the provided socket
     * [@param socket {Socket}]: an individual socket to sync this entity with
     * [@param roomName {string}]: the room to broadcast the sync to
     */
    public sync(socket?: Socket, roomName?: string) {
        // Merge the id into the data object
        const params = Object.assign(this.parent.getSerializable(), {id: this.id});
        const syncResponse = {
            id: this.id,
            params,
            type: this.type.name,
        };

        if (!isNullOrUndefined(socket)) {
            socket.emit(IOEvent.syncNetworkEntity, syncResponse);
        } else {
            NetworkIndex.syncServer.broadcast(IOEvent.syncNetworkEntity, syncResponse, roomName);
        }
    }
}
