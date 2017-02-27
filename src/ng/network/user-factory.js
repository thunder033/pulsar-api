/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

function userFactory(Socket, Room) {
    class User {

        constructor(name, socket) {
            this.name = name;
            this.socket = socket;

            this.rooms = [];

            socket.on('joinedRoom', data => this.onJoin(data));

            socket.on('userDetailsUpdate', (data) => {
                Object.assign(this, data);
            });
        }

        onJoin(data) {
            this.rooms.push(Room.getByName(data.name));
        }
    }

    return User;
}

module.exports = userFactory;