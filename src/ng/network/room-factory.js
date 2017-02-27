/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const Room = require('room');

function roomFactory(Socket){
    const rooms = {};

    function fromNetworkEntity(data) {
        const room = new Room(data.name);
        Object.assign(room, data);
        rooms[room.getName()] = room;
        return room;
    }

    Socket.on('roomCreated', fromNetworkEntity);

    return {
        getByName(name) {
            return rooms[name];
        }
    }
}

module.exports = roomFactory;