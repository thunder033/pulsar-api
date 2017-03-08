/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const MDT = require('../mallet/mallet.dependency-tree').MDT;

module.exports = {shipFactory, resolved(ADT){return [
    ADT.network.NetworkEntity,
    MDT.Geometry,
    shipFactory]}};

function shipFactory(NetworkEntity, Geometry) {
    return class Ship extends NetworkEntity {
        constructor(params) {
            super(params);
            this.transform = new Geometry.Transform();
        }

        sync(data) {
            const pos = data.position;
            this.transform.position.set(pos.x, pos.y, pos.z);

            delete data.position;

            super.sync(data);
        }

        advance(units) {

        }

        strafe(units) {

        }
    }
}