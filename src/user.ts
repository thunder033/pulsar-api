'use strict';
/**
 * Created by Greg on 2/17/2017.
 */

import {Component, Composite, IComponent} from './component';
import {IOEvent} from './event-types';
import {INetworkEntity, Networkable} from './network-entity';
import {Room} from './room';
import {SyncServer} from './sync-server';
import Socket = SocketIO.Socket;
import Timer = NodeJS.Timer;

export interface IUserComponent extends Component {
    init(socket: Socket, server: SyncServer, user: User): void;
    onInit(): void;
    onJoin(): void;
    onDisconnect(): void;
}

export abstract class UserComponent extends Component implements IUserComponent {
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

    public onSessionEnd(): void {
        return undefined;
    }
}

export class User extends Composite implements INetworkEntity {

    // We need more server functionality to support re-connection
    public static DISCONNECT_TIMEOUT_DURATION: number = 0;

    protected server: SyncServer;
    protected socket: Socket;
    protected rooms: Room[];
    protected disconnectTimer: Timer;

    private terminated: boolean;
    private name: string;

    constructor(socket: Socket, server: SyncServer, componentTypes: IComponent[] = []) {
        super();
        this.server = server;
        this.socket = socket;
        this.rooms = [];

        this.terminated = false;
        this.disconnectTimer = null;

        socket.on(IOEvent.join, this.onJoin.bind(this));
        socket.on(IOEvent.disconnect, this.onDisconnect.bind(this));

        componentTypes.forEach((type: IComponent) => this.addComponent(type));

        this.getComponent(Networkable).sync(this.socket);
    }

    public addComponent(component: IComponent): Component {
        return (super.addComponent(component) as UserComponent)
            .init(this.socket, this.server, this);
    }

    public join(room: Room): void {
        console.log(`${this.name} join ${room.getName()}`);
        this.socket.join(room.getName());
        room.add(this);
        this.rooms.push(room);
        this.socket.emit(IOEvent.joinedRoom, room.getSerializable());
        this.invokeComponentEvents('onJoin', room);
    }

    public leave(room: Room): void {
        console.log(`${this.name} leave ${room.getName()}`);
        this.socket.leave(room.getName());
        room.remove(this);

        const roomIndex = this.rooms.indexOf(room);
        this.rooms.splice(roomIndex, 1);

        this.socket.emit(IOEvent.leftRoom, room.getSerializable());
        this.invokeComponentEvents('onLeave', room);
    }

    public getName(): string {
        return this.name;
    }

    public getSerializable(): Object {
        return {
            name: this.name,
        };
    }

    public getId(): string {
        return this.getComponent(Networkable).getId();
    }

    public sync(socket?: SocketIO.Socket, reqId?: string): void {
        this.getComponent(Networkable).sync(socket, reqId);
    }

    private terminateSession() {
        console.log(`terminate session for ${this.name}`);
        this.terminated = true;

        while (this.rooms.length > 0) {
            this.leave(this.rooms[0]);
        }

        if (!this.server.removeUser(this)) {
            console.warn(`Failed to remove user [${this.name}] from the server`);
        }

        this.invokeComponentEvents('onSessionEnd');
    }

    private onDisconnect() {
        if (!this.terminated) {
            this.disconnectTimer = setTimeout(() => this.terminateSession(), User.DISCONNECT_TIMEOUT_DURATION);
        }

        this.invokeComponentEvents('onDisconnect');
    }

    private onJoin(data) {
        console.log(`${data.name} joined`);
        const room: Room = this.server.getDefaultRoom();

        this.server.syncClient(this.socket);

        this.name = data.name;
        this.join(room);
    }
}
