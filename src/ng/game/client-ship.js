/**
 * Created by gjr8050 on 3/9/2017.
 */
'use strict';
const GameEvent = require('event-types').GameEvent;

module.exports = {shipFactory, resolve(ADT){return [
    ADT.network.NetworkEntity,
    ADT.network.Connection,
    shipFactory]}};

function shipFactory(NetworkEntity, Connection) {

    class ClientShip extends NetworkEntity {

    }

    Connection.ready().then(socket => {
        socket.on(GameEvent.shipSync);
    });

    return ClientShip;
}