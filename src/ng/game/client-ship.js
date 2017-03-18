/**
 * Created by gjr8050 on 3/9/2017.
 */

const GameEvent = require('event-types').GameEvent;
const MDT = require('../mallet/mallet.dependency-tree').MDT;
const Track = require('game-params').Track;
const ShipEngine = require('game-params').ShipEngine;

module.exports = {shipFactory,
resolve: ADT => [
    ADT.network.NetworkEntity,
    ADT.network.Connection,
    MDT.Geometry,
    MDT.Scheduler,
    MDT.Math,
    ADT.network.Clock,
    shipFactory]};

/**
 *
 * @param NetworkEntity
 * @param Connection
 * @param Geometry
 * @param Scheduler
 * @param MM
 * @param Clock {Clock}
 * @returns {ClientShip}
 */
function shipFactory(NetworkEntity, Connection, Geometry, Scheduler, MM, Clock) {
    const utf8Decoder = new TextDecoder('utf-8');

    function lerp(a, disp, p) {
        return MM.Vector3.scale(disp, p).add(a);
    }

    class ClientShip extends NetworkEntity {
        constructor(params) {
            super(params);

            this.disp = MM.vec3(0);

            this.tPrev = new Geometry.Transform();
            this.tDest = new Geometry.Transform();
            this.tRender = new Geometry.Transform();

            this.lastUpdate = Clock.getNow();
            this.syncElapsed = 0;
            this.lerpPct = 0;

            Scheduler.schedule(this.update.bind(this));
        }

        sync(bufferView) {
            this.tPrev.position.x = this.tDest.position.x;
            this.tDest.position.x = bufferView.getFloat32(NetworkEntity.ID_LENGTH);
            this.disp = MM.Vector3.subtract(this.tDest.position, this.tPrev.position);

            const updateTime = Clock.getNow();
            this.syncElapsed = updateTime - this.lastUpdate;
            this.lastUpdate = updateTime;

            this.lerpPct = 0;

            super.sync({});
        }

        strafe(direction) {
            Connection.getSocket().get().emit(GameEvent.command, direction);
            // this.disp.x = ShipEngine.MOVE_SPEED * direction;
        }
        
        update(dt) {
            this.lerpPct += dt / this.syncElapsed;
            this.tRender.position.set(lerp(this.tPrev.position, this.disp, this.lerpPct));
        }

        getTransform() {
            return this.tRender;
        }
    }

    function onShipSync(data) {
        if (data instanceof ArrayBuffer) {
            const view = new DataView(data);
            const id = utf8Decoder.decode(view).substr(0, NetworkEntity.ID_LENGTH);
            NetworkEntity.getById(ClientShip, id).then(ship => ship.sync(view));
        }
    }

    NetworkEntity.registerType(ClientShip);

    Connection.ready().then((socket) => {
        socket.get().on(GameEvent.shipSync, onShipSync);
    });

    return ClientShip;
}
