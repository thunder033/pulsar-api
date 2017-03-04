'use strict';
/**
 * Created by Greg on 2/17/2017.
 */
import Socket = SocketIO.Socket;

import * as http from 'http';
import * as socketio from 'socket.io';
import {Connection} from './connection';
import {Component, Composite, IComponent} from './component';
import {IOEvent} from './event-types';
import {Networkable} from './network-entity';
import {Room} from './room';
import {User} from './user';

export interface IServerComponent {
    init(io: SocketIO.Server, server: SyncServer): void;
    onInit(): void;
    getName(): string;
    getUserComponents(): IComponent[];
}

/**
 * Server components define various server behaviors. They have references to the IO Server and their SyncServer. They
 * also define what peer behaviors are defined for users on the server
 */
export abstract class ServerComponent extends Component implements IServerComponent {
    protected io: SocketIO.Server;
    protected userComponents: IComponent[];
    protected server: SyncServer;

    private name: string;

    /**
     * @param syncServer:
     * @param userComponents: Components that should be initialized on each user created on the server
     */
    constructor(syncServer: SyncServer, userComponents: IComponent[] = []) {
        super(syncServer);
        this.name = this.constructor.name;
        this.userComponents = userComponents;
    }

    public init(io: SocketIO.Server, server: SyncServer): Component {
        this.io = io;
        this.server = server;
        this.onInit();
        return this;
    }

    public onInit(): void {
        return undefined;
    }

    public syncClient(socket: Socket): void {
        return undefined;
    }

    public getName(): string {
        return this.name;
    }

    public getUserComponents(): IComponent[] {
        return this.userComponents;
    }
}

export class SyncServer extends Composite {

    private rooms: Map<string, Room>;
    private io: SocketIO.Server;
    private users: User[];
    private defaultRoom: Room;

    constructor(httpServer: http.Server) {
        super();
        this.users = [];
        this.defaultRoom = null;
        this.rooms = new Map<string, Room>();

        this.io = socketio(httpServer);
        this.io.use((socket: Socket, next) => {
            this.registerConnection(socket);
            next();
        });
    }

    public getUsers(): User[] {
        return this.users;
    }

    public addRoom(room: Room): void {
        if (this.rooms.has(room.getId())) {
            throw new Error(`Room with name ${name} already exists on this server! Room names must unique`);
        }

        this.rooms.set(room.getId(), room);

        if (this.defaultRoom === null) {
            this.defaultRoom = room;
        }
    };

    public createRoom(name: string): Room {
        const room = new Room(name);
        this.addRoom(room);
        this.broadcast(IOEvent.roomCreated, room.getId());
        return room;
    }

    public addComponent(component: IComponent): Component {
        console.log('add server component: ', component.name);
        return (super.addComponent(component) as ServerComponent).init(this.io, this);
    }

    public registerConnection(socket: Socket) {
        const user = new User(socket, this, this.getUserComponents());
        user.setName(socket.handshake.query.name);
        this.users.push(user);
    };

    public syncClient(socket: Socket): void {
        this.rooms.forEach((room) => {
            if (room.constructor === Room) {
                socket.emit(IOEvent.roomCreated, room.getId());
            }
        });

        this.invokeComponentEvents('syncClient', socket);
    };

    public getDefaultRoom(): Room {
        return this.defaultRoom;
    }

    /**
     * Broadcasts an event to users on the server, either in the specified room or the server default
     * @param evt {string}: the name of the event
     * @param data {any}: data to send to handlers
     * @param [room=Server Default] {Room}: the room to broadcast to
     */
    public broadcast(evt: string, data: any, room: Room = this.defaultRoom) {
        this.io.sockets.in(room.getName()).emit(evt, data);
    }

    /**
     * Removes a user from the room and indicates if there were successfully removed
     * @param targetUser
     * @returns {boolean}
     */
    public removeUser(targetUser: User): boolean {
        return this.users.some((user: User, i: number) => {
            if (targetUser === user) {
                this.rooms.forEach((room) => {
                    room.remove(user);
                });
                this.users.splice(i, 1);
                return true;
            }

            return false;
        });
    }

    /**
     * Generates an flat array of all user components required by server components
     * @returns {IComponent[]}
     */
    private getUserComponents(): IComponent[] {
        const userComponents: any = (this.getComponents() as ServerComponent[]).map((c) => c.getUserComponents());
        return [].concat.apply([Networkable, Connection], userComponents);
    }
}
