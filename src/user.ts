'use strict';
/**
 * Created by Greg on 2/17/2017.
 */
import {IOEvent, SyncServer} from './sync-server';
import Socket = SocketIO.Socket;
import Timer = NodeJS.Timer;
import {Room} from './room';
import {Component, Composite, IComponent} from './component';
import {INetworkEntity} from './network-entity';
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
        this.socket.emit('joinedRoom', room.getSerializable());
        this.invokeComponentEvents('onJoin', room);
    }

    public getName(): string {
        return this.name;
    }

    public getSerializable(): Object {
        return {
            id: this.id,
            name: this.name,
        };
    }

    private onDisconnect() {
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
