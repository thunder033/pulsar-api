'use strict';
/**
 * Created by Greg on 2/17/2017.
 */
import * as http from 'http';
import * as socketio from 'socket.io';
import {Component, Composite, IComponent} from './component';
import {Room} from './room';
import Socket = SocketIO.Socket;
import {User} from './user';

function strEnum<T extends string>(o: T[]): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export const IOEvent = strEnum([
    'connection',
    'join',
    'disconnect',
]);

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
     * @param userComponents: Components that should be initialized on each user created on the server
     */
    constructor(userComponents: IComponent[] = []) {
        super();
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

    public getName(): string {
        return this.name;
    }

    public getUserComponents(): IComponent[] {
        return this.userComponents;
    }
}

export class SyncServer extends Composite {

    private rooms = {};
    private io: SocketIO.Server;
    private users: User[];
    private defaultRoom: Room;

    constructor(httpServer: http.Server) {
        super();
        this.users = [];
        this.defaultRoom = null;

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
        if (this.rooms[room.name] instanceof Room) {
            throw new Error(`Room with name ${name} already exists on this server! Room names must unique`);
        }

        this.rooms[room.name] = room;

        if (this.defaultRoom === null) {
            this.defaultRoom = room;
        }
    };

    public createRoom(name: string): Room {
        if (this.rooms[name] instanceof Room) {
            throw new Error(`Room with name ${name} already exists on this server! Room names must unique`);
        }

        const room = new Room(name);
        this.addRoom(room);
        return room;
    }

    public addComponent(component: IComponent): Component {
        return (super.addComponent(component) as ServerComponent).init(this.io, this);
    }

    public registerConnection(socket: Socket) {
        this.users.push(new User(socket, this, this.getUserComponents()));
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
                this.users.splice(i, 1);
                return true;
            }

            return false;
        });
    }

    private getUserComponents(): IComponent[] {
        // return this.getComponents()
        return [];
    }
}
