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
    const utf8Decoder = new TextDecoder('utf-8');
    class ClientShip extends NetworkEntity {
        constructor(params) {
            super(params);
            this.transform = new Geometry.Transform();
        }

        strafe(direction) {
            Connection.getSocket().get().emit(GameEvent.command, direction);
        }

        getTransform() {
            return this.transform;
        }
    }

    function onShipSync(data) {
        if (data instanceof ArrayBuffer) {
            const view = new DataView(data);
            const id = utf8Decoder.decode(view).substr(0, NetworkEntity.ID_LENGTH);
            console.log(utf8Decoder.decode(view));
            NetworkEntity.getById(ClientShip, id).then((ship) => {
                ship.transform.position.x = view.getFloat32(NetworkEntity.ID_LENGTH);
            });
        }
    }

    NetworkEntity.registerType(ClientShip);

    Connection.ready().then((socket) => {
        socket.get().on(GameEvent.shipSync, onShipSync);
    });

    return ClientShip;
}
