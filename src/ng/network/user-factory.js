/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const MatchEvents = require('event-types').MatchEvent;
const IOEvent = require('event-types').IOEvent;

function userFactory(ClientRoom, $q, NetworkEntity) {

    const users = {};
    let localUser = null;

    class User extends NetworkEntity {

        constructor(params) {

            super(params.id);

            this.name = params.name;

//            socket.on(IOEvent.joinedRoom, data => this.onJoin(data));
        }

        // onJoin(data) {
        //     const room = ClientRoom.getByName(data.name);
        //     this.rooms.push(room);
        //     room.add(this);
        // }

        getName() {
            return this.name;
        }
    }

    return User;
}

module.exports = userFactory;