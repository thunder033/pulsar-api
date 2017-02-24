/**
 * Created by gjr8050 on 2/23/2017.
 */

import {IUser} from './user';

/**
 * Encapsulates and defines behaviors for SocketIO rooms
 */
export class Room {
    public name: string;

    protected users: IUser[];
    // How many users the room can contain
    private capacity: number = NaN;

    constructor(name: string) {
        this.name = name;
    }

    public add(user: IUser): void {
        if (isNaN(this.capacity) || this.users.length < this.capacity) {
            this.users.push(user);
        } else {
            throw new Error(`Room is full and cannot accept any more users`);
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
}
