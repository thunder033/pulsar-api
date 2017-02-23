'use strict';
/**
 * Created by Greg on 2/17/2017.
 */
import {IOEvent, SyncServer} from './sync-server';
import Socket = SocketIO.Socket;
import Timer = NodeJS.Timer;

export interface IUser {
    new (socket: Socket, decorator: any): User;
}

export class User {

    private static eventHandlers = {};

    protected server: SyncServer;
    protected socket: Socket;
    protected room: string;
    private name: string;

    constructor(socket: Socket, server: SyncServer) {
        this.server = server;
        this.socket = socket;

        socket.on(IOEvent.join, this.onJoin.bind(this));
        socket.on(IOEvent.disconnect, this.onDisconnect.bind(this));

        Object.keys(User.eventHandlers).forEach((evt) => {
            this.socket.on(evt, (data) => {
                User.eventHandlers[evt](data, this, this.socket, this.server);
            });
        });
    }

    protected onDisconnect(data) {
        if (!this.server.removeUser(this)) {
            console.warn(`Failed to remove user [${this.name}] from the server`);
        }
    }

    private onJoin(data) {
        console.log(`${data.name} joined`);
        const room = this.room || this.server.getRoom();

        this.name = data.name;
        this.socket.join(room);
    }
}
