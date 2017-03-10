/**
 * Created by gjr8050 on 3/9/2017.
 */
'use strict';
const GameEvent = require('event-types').GameEvent;
const MDT = require('../mallet/mallet.dependency-tree').MDT;

module.exports = {shipFactory, resolve(ADT){return [
    ADT.network.NetworkEntity,
    ADT.network.Connection,
    MDT.Geometry,
    shipFactory]}};

function shipFactory(NetworkEntity, Connection, Geometry) {

    class ClientShip extends NetworkEntity {
        constructor(params) {
            super(params);
            this.transform = new Geometry.Transform();
        }

        strafe(units) {

        }
    }

    function onShipSync(data) {
        if(data.shipId)
    }

    Connection.ready().then(socket => {
        socket.on(GameEvent.shipSync);
    });

    return ClientShip;
}