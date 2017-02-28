/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const MatchEvents = require('event-types').MatchEvent;
const IOEvents = require('event-types').MatchEvent;

function userFactory(Room, Match) {
    class User {

        constructor(name, socket) {
            this.name = name;
            this.socket = socket;

            this.match = null;
            this.rooms = [];

            socket.on(IOEvents.joinedRoom, data => this.onJoin(data));

            socket.on('userDetailsUpdate', (data) => {
                Object.assign(this, data);
            });
        }

        onJoin(data) {
            const room = Room.getByName(data.name);

            if(room instanceof Match) {
                this.match = room;
            }

            this.rooms.push(room);
        }
    }

    return User;
}

module.exports = userFactory;