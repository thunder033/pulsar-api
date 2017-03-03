/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const IOEvent = require('event-types').IOEvent;
const EventTarget = require('eventtarget');

function networkEntityFactory(Connection, $q, SimpleSocket) {

    class NetworkEntity extends EventTarget {

        constructor(id) {
            super();
            this.id = id;
        }

        getId() {
            return this.id;
        }

        reconstruct(params) {

        }

        sync(params) {
            Object.assign(this, params);
        }

        static registerType(type) {
            NetworkEntity.types.set(type.name, type);
            NetworkEntity.entities.set(type.name, new Map());
        }

        /**
         * Retrieve a network entity constructor based on name
         * @param typeName
         * @returns {undefined|V|V}
         */
        static getType(typeName) {
            if(NetworkEntity.types.has(typeName) === false) {
                throw new ReferenceError(`Type ${typeName} is not a valid network entity`);
            }

            return NetworkEntity.types.get(typeName);
        }

        /**
         * Returns a network entity identified by type and id
         * @param type {class}
         * @param id {string}
         * @returns {Promise<NetworkEntity>}
         */
        static getById(type, id) {
            if(!type || typeof id !== 'string') {
                throw new Error(`Network entities must be identified by both type and name`);
            }

            if(NetworkEntity.localEntityExists(type, id) === true) {
                return $q.when(NetworkEntity.entities.get(type.name).get(id));
            } else {
                return Connection.getSocket().request(IOEvent.syncNetworkEntity, {type: type.name, id: id})
                    .then(NetworkEntity.reconstruct);
            }
        }

        static localEntityExists(type, id) {
            return NetworkEntity.entities.get(type.name).has(id);
        }

        /**
         * Parses a response to rebuild a network entity
         * @param data
         * @returns {NetworkEntity}
         */
        static reconstruct(data) {
            const type = NetworkEntity.getType(data.type);
            let entity = null;
            if(NetworkEntity.localEntityExists(type, data.id) === true) {
                entity = NetworkEntity.entities.get(type.name).get(data.id);
                entity.sync(data.params);
            } else {
                entity = new type(data.params);
                NetworkEntity.entities.get(type.name).set(data.id, entity);
            }

            return entity;
        }
    }

    NetworkEntity.types = new Map();
    NetworkEntity.entities = new Map();

    Connection.ready().then(socket => {
        socket.get().on(IOEvent.syncNetworkEntity, NetworkEntity.reconstruct);
    });

    return NetworkEntity;
}

module.exports = networkEntityFactory;