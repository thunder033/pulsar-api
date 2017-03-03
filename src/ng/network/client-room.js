/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const IOEvent = require('event-types').IOEvent;

function roomFactory(Connection, NetworkEntity, User) {
    const rooms = {};

    class ClientRoom extends NetworkEntity {

        constructor(name) {
            super(name);
            rooms[name] = this;
        }

        add(user) {
            if (isNaN(this.capacity) || this.users.length < this.capacity) {
                this.users.push(user);

                const evt = new Event(IOEvent.joinedRoom);
                evt.user = user;
                this.dispatchEvent(evt);
            } else {
                throw new Error(`Room is full and cannot accept any more users`);
            }
        }

        remove(user) {
            const userIndex = this.users.indexOf(user);

            if(userIndex > -1) {
                this.users.splice(userIndex, 1);

                const evt = new Event(IOEvent.leftRoom);
                evt.user = user;
                this.dispatchEvent(evt);
            }
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

    Connection.ready().then(socket => {
        socket.get().on(IOEvent.joinedRoom, (data) => {
            NetworkEntity.getById(User, data.user).then(user => ClientRoom.getByName(data.room).add(user));
        });

        socket.get().on(IOEvent.leftRoom, (data) => {
            NetworkEntity.getById(User, data.user).then(user => ClientRoom.getByName(data.room).remove(user));
        });
    });


    return ClientRoom
}

module.exports = roomFactory;