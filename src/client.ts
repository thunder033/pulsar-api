'use strict';
/**
 * Created by Greg on 2/17/2017.
 */

import {Component, Composite, IComponentCtor} from './component';
import {IOEvent} from 'event-types';
import {INetworkEntity, Networkable} from './network-index';
import {Room} from './room';
import {SyncServer} from './sync-server';
import Socket = SocketIO.Socket;
import {CompositeNetworkEntity} from './composite-network-entity';

export interface IClientComponent extends Component {
    init(socket: Socket, server: SyncServer, user: Client): void;
    onInit(): void;
    onJoin(data): void;
    onDisconnect(): void;
}

export abstract class ClientComponent extends Component implements IClientComponent {
    protected server: SyncServer;
    protected socket: Socket;
    protected user: Client;

    public init(socket: Socket, server: SyncServer, user: Client): ClientComponent {
        this.server = server;
        this.socket = socket;
        this.user = user;
        this.onInit();
        return this;
    }

    public onInit(): void {
        return undefined;
    }

    public onJoin(data): void {
        return undefined;
    }

    public onDisconnect(): void {
        return undefined;
    }

    public onSessionEnd(): void {
        return undefined;
    }
}

export class Client extends CompositeNetworkEntity {

    protected server: SyncServer;
    protected socket: Socket;
    protected rooms: Room[];

    private name: string;

    constructor(socket: Socket, server: SyncServer, componentTypes: IComponentCtor[] = []) {
        super();
        this.server = server;
        this.socket = socket;
        this.rooms = [];

        socket.on(IOEvent.disconnect, this.onDisconnect.bind(this));

        componentTypes.forEach((type: IComponentCtor) => this.addComponent(type));
        socket.emit(IOEvent.joinServer, {userId: this.getComponent(Networkable).getId(), serverTime: Date.now()});
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public addComponent(component: IComponentCtor): Component {
        return (super.addComponent(component) as ClientComponent)
            .init(this.socket, this.server, this);
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getSerializable(): Object {
        return Object.assign(super.getSerializable(), {
            name: this.name,
        });
    }

    public onSessionEnd() {
        this.invokeComponentEvents('onSessionEnd');
    }

    public onDisconnect() {
        this.invokeComponentEvents('onDisconnect');
    }

}
