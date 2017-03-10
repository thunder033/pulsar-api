/**
 * Created by gjr8050 on 3/9/2017.
 */

const GameEvent = require('event-types').GameEvent;
const MDT = require('../mallet/mallet.dependency-tree').MDT;

module.exports = {shipFactory,
resolve: ADT => [
    ADT.network.NetworkEntity,
    ADT.network.Connection,
    MDT.Geometry,
    shipFactory]};

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
        if (data instanceof Buffer) {
            const id = data.toString('utf8', 0, NetworkEntity.ID_LENGTH);
            NetworkEntity.getById(ClientShip, id).then((ship) => {
                ship.transform.position.x = data.readFloatLE(NetworkEntity.ID_LENGTH);
            });
        }
    }

    Connection.ready().then((socket) => {
        socket.on(GameEvent.shipSync, onShipSync);
    });

    return ClientShip;
}
