/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

function roomFactory(Socket, NetworkEntity) {
    const rooms = {};

    class ClientRoom extends NetworkEntity {

        constructor(name) {
            super(name);
            rooms[name] = this;
        }

        add(user) {
            if (isNaN(this.capacity) || this.users.length < this.capacity) {
                this.users.push(user);
            } else {
                throw new Error(`Room is full and cannot accept any more users`);
            }
        }

        remove(user) {
            const userIndex = this.users.indexOf(user);
            this.users.splice(userIndex, 1);
        }

        getName() {
            return this.name;
        }

        setCapacity(capacity) {
        this.capacity = capacity;
    }

        getCapacity() {
            return this.capacity;
        }

        sync(params) {
            params.capacity = typeof params.capacity === 'number' ? params.capacity : NaN;

            this.users.length = 0;
            params.users.forEach(userId => NetworkEntity
                .getById(User, userId)
                .then(user => this.users.push(user)));

            delete params.users;
            super.sync(params);
        }

        static getByName(name) {
            return rooms[name];
        }

        getUsers() {
            return this.users;
        }
    }

    function fromNetworkEntity(data) {
        console.log(`create room ${data.name}`);
        const room = new ClientRoom(data.name);
        data.capacity = typeof data.capacity === 'number' ? data.capacity : NaN;
        Object.assign(room, data);
        return room;
    }

    Socket.on('roomCreated', fromNetworkEntity);

    return ClientRoom
}

module.exports = roomFactory;