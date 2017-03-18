import {ServerComponent, SyncServer} from './sync-server';
import {Room} from './room';
import {IOEvent} from './event-types';
import {Client} from './user';
/**
 * Created by gjrwcs on 3/6/2017.
 */

export class Building extends ServerComponent {

    private rooms: Map<string, Room>;
    private defaultRoom: Room;

    constructor(syncServer: SyncServer) {
        super(syncServer);

        this.rooms = new Map<string, Room>();
        this.defaultRoom = null;
    }

    /**
     * Add a room to this server. If there are no rooms the room becomes the default
     * @param room {Room}: the room to add
     */
    public addRoom(room: Room): void {
        if (this.rooms.has(room.getName())) {
            throw new Error(`Room with name ${name} already exists on this server! Room names must unique`);
        }

        // Rooms are indexed here by name because socket-io emits messages by room name
        this.rooms.set(room.getName(), room);

        if (this.defaultRoom === null) {
            this.defaultRoom = room;
        }
    };

    /**
     * Factory function to create and add a room
     * @param name {string}: the name of the room
     * @returns {Room}: the created room
     */
    public createRoom(name: string): Room {
        const room = new Room(name);
        this.addRoom(room);
        this.server.broadcast(IOEvent.roomCreated, room.getName());
        return room;
    }

    /**
     * Get the default room that new clients will be added to
     * @returns {Room}
     */
    public getDefaultRoom(): Room {
        return this.defaultRoom;
    }

    public onClientTerminated(user: Client): void {
        this.rooms.forEach((room) => {
            room.remove(user);
        });
    }

    public syncClient(socket: SocketIO.Socket): void {
        this.rooms.forEach((room) => {
            if (room.constructor === Room) {
                socket.emit(IOEvent.roomCreated, room.getId());
            }
        });
    }
}
