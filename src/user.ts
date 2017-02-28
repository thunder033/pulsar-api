'use strict';
/**
 * Created by Greg on 2/17/2017.
 */

import {Component, Composite, IComponent} from './component';
import {IOEvent} from './event-types';
import {INetworkEntity} from './network-entity';
import {Room} from './room';
import {SyncServer} from './sync-server';
import Socket = SocketIO.Socket;
import Timer = NodeJS.Timer;
import * as uuid from 'uuid/v4';

export interface IUser {
    getName(): string;
}

export interface IUserComponent extends Component {
    init(socket: Socket, server: SyncServer, user: User): void;
    onInit(): void;
    onJoin(): void;
    onDisconnect(): void;
}

export class UserComponent implements IUserComponent {
    protected server: SyncServer;
    protected socket: Socket;
    protected user: User;

    public init(socket: Socket, server: SyncServer, user: User): UserComponent {
        this.server = server;
        this.socket = socket;
        this.user = user;
        this.onInit();
        return this;
    }

    public onInit(): void {
        return undefined;
    }

    public onJoin(): void {
        return undefined;
    }

    public onDisconnect(): void {
        return undefined;
    }
}

export class User extends Composite implements IUser, INetworkEntity {

    protected server: SyncServer;
    protected socket: Socket;
    protected room: Room;

    private name: string;
    private id: string;

    constructor(socket: Socket, server: SyncServer, componentTypes: IComponent[] = []) {
        super();
        this.server = server;
        this.socket = socket;
        this.id = uuid();
        this.room = null;

        socket.on(IOEvent.join, this.onJoin.bind(this));
        socket.on(IOEvent.disconnect, this.onDisconnect.bind(this));

        componentTypes.forEach((type: IComponent) => this.addComponent(type));
    }

    public addComponent(component: IComponent): Component {
        return (super.addComponent(component) as UserComponent)
            .init(this.socket, this.server, this);
    }

    public join(room: Room): void {
        this.socket.join(room.getName());
        room.add(this);
        this.room = room;
        this.socket.emit(IOEvent.joinedRoom, room.getSerializable());
        this.invokeComponentEvents('onJoin', room);
    }

    public leave(room: Room): void {
        this.socket.leave(room.getName());
        room.remove(this);
        this.room = null;
        this.socket.emit(IOEvent.leftRoom, room.getSerializable());
        this.invokeComponentEvents('onLeave', room);
    }

    public getName(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public getSerializable(): Object {
        return {
            id: this.id,
            name: this.name,
        };
    }

    private onDisconnect() {
        if (this.room instanceof Room) {
            this.leave(this.room);
        }

        if (!this.server.removeUser(this)) {
            console.warn(`Failed to remove user [${this.name}] from the server`);
        }
        this.invokeComponentEvents('onDisconnect');
    }

    private onJoin(data) {
        console.log(`${data.name} joined`);
        const room = this.room || this.server.getDefaultRoom();

        this.name = data.name;
        this.join(room);
    }
}
