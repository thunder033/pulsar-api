/**
 * Created by gjr8050 on 2/23/2017.
 */

import {User} from './user';
import {NetworkEntity} from './network-entity';
import {IOEvent} from './event-types';

/**
 * Encapsulates and defines behaviors for SocketIO rooms
 */
export class Room extends NetworkEntity {
    public name: string;

    protected users: User[];
    // How many users the rooms can contain
    private capacity: number = NaN;

    constructor(name: string) {
        super(Room);
        this.name = name;
        this.users = [];
    }

    public contains(user: User): boolean {
        return this.users.indexOf(user) > -1;
    }

    public add(user: User): void {
        if (isNaN(this.capacity) || this.users.length < this.capacity) {
            if (!this.contains(user)) { // users can't be in the room twice
                console.log(`${this.name} add user ${user.getName()}`);
                this.users.push(user);

                const message = {userId: user.getId(), roomId: this.getId()};
                user.getSocket().join(this.name);
                user.getSocket().emit(IOEvent.joinedRoom, message);
                user.getSocket().broadcast.in(this.name).emit(IOEvent.joinedRoom, message);
            }
        } else {
            throw new Error(`Room is full and cannot accept any more users`);
        }
    }

    public remove(user: User): void {
        const userIndex = this.users.indexOf(user);
        if (userIndex > -1) {
            this.users.splice(userIndex, 1);

            const message = {userId: user.getId(), roomId: this.getId()};
            user.getSocket().leave(this.name);
            user.getSocket().emit(IOEvent.leftRoom, message);
            user.getSocket().broadcast.in(this.name).emit(IOEvent.leftRoom, message);
        }
    }

    public getName(): string {
        return this.name;
    }

    protected setCapacity(capacity: number): void {
        this.capacity = capacity;
    }

    public getCapacity(): number {
        return this.capacity;
    }

    public getSerializable(): Object {
        return Object.assign(super.getSerializable(), {
            capacity: this.capacity,
            name: this.name,
            users: this.users.map((user) => user.getId()),
        });
    }
}
