'use strict';
/**
 * Created by Greg on 2/17/2017.
 */
import * as http from 'http';
import * as socketio from 'socket.io';
import Socket = SocketIO.Socket;
import {IUser, User} from './user';
import {isNullOrUndefined} from "util";

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

class Room {
    public name: string;
    public userType: IUser;
    public decorator: ServerDecorator;

    constructor(name: string, userType: IUser, decorator) {
        this.name = name;
        this.userType = userType;
        this.decorator = decorator;
    }
}

export abstract class ServerDecorator {

    protected syncServer: SyncServer;
    private roomName: string;

    constructor(server: SyncServer, roomName: string) {
        this.syncServer = server;
        this.roomName = roomName;
    }

    public getServer(): SyncServer {
        return this.syncServer;
    }

    public getRoomName(): string {
        return this.roomName;
    }
}

export class SyncServer {

    private rooms = {};
    private io;
    private connections: User[];
    private defaultRoom: string = 'room1';

    constructor(httpServer: http.Server) {
        this.connections = [];

        this.io = socketio(httpServer);
        this.io.use((socket: Socket, next) => {
            this.registerConnection(socket);
            next();
        });
    }

    public getUsers(): User[] {
        return this.connections;
    }

    public addRoom(name: string, userType: IUser, apiDecorator: any) {
        this.rooms[name] = new Room(name, userType, new apiDecorator(this));
    }

    public registerConnection(socket: Socket) {
        let user: User = null;
        const room: Room = this.rooms[socket.handshake.query.room];
        if (!isNullOrUndefined(room)) {
            console.log(`connect to ${room.name}`);
            user = new room.userType(socket, room.decorator);
        } else {
            user = new User(socket, this);
        }
        this.connections.push(user);
    };

    public getRoom(): string {
        return this.defaultRoom;
    }

    public broadcast(evt: string, data: any, room: string = this.defaultRoom) {
        this.io.sockets.in(room).emit(evt, data);
    }

    /**
     * Removes a user from the room and indicates if there were successfully removed
     * @param targetUser
     * @returns {boolean}
     */
    public removeUser(targetUser: User): boolean {
        return this.connections.some((user: User, i: number) => {
            if (targetUser === user) {
                this.connections.splice(i, 1);
                return true;
            }

            return false;
        });
    }
}
