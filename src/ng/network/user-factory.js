/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const MatchEvents = require('event-types').MatchEvent;
const IOEvents = require('event-types').IOEvent;

function userFactory(ClientRoom) {
    class User {

        constructor(name, socket) {
            this.name = name;
            this.socket = socket;

            this.match = null;
            this.rooms = [];

            socket.on(IOEvents.joinedRoom, data => this.onJoin(data));

            socket.on(IOEvents.userDetailsUpdate, (data) => {
                Object.assign(this, data);
            });
        }

        onJoin(data) {
            const room = ClientRoom.getByName(data.name);
            this.rooms.push(room);
            room.add(this);
        }

        getName() {
            return this.name;
        }
    }

    return User;
}

module.exports = userFactory;