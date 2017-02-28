/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const Room = require('room').Room;

function roomFactory(Socket){
    const rooms = {};

    class ClientRoom extends Room {

        constructor(name) {
            super(name);
            rooms[name] = this;
        }

        static getByName(name) {
            return rooms[name];
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