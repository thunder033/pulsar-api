/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const IOEvent = require('event-types').IOEvent;
const EventTarget = require('eventtarget');

module.exports = {networkEntityFactory, resolve(ADT) {return [
    ADT.network.Connection,
    ADT.ng.$q,
    ADT.ng.$rootScope,
    networkEntityFactory];}};

function networkEntityFactory(Connection, $q, $rootScope) {

    /**
     * Manages synchronization for a entity with the server instance
     */
    class NetworkEntity extends EventTarget {

        constructor(id) {
            super();
            this.id = id;
            this.syncTime = ~~performance.now();
        }

        getId() {
            return this.id;
        }

        reconstruct(params) {

        }

        sync(params) {
            Object.assign(this, params);
            this.syncTime = ~~performance.now();

            console.log(`sync ${this.constructor.name} ${this.id} at ${this.syncTime}`);
            $rootScope.$evalAsync();
        }

        static registerType(type) {
            let baseType = type;
            NetworkEntity.lookupTypes.forEach(candidateType => {
                if(type.prototype instanceof candidateType) {
                    baseType = candidateType;
                }
            });

            NetworkEntity.constructorTypes.set(type.name, type);
            NetworkEntity.lookupTypes.set(type.name, baseType);
            if(baseType === type) {
                NetworkEntity.entities.set(type.name, new Map());
            }
        }

        static getConstructorType(typeName) {
            let resolvedType = typeName;
            if(NetworkEntity.constructorTypes.has(typeName) === false) {
                if (NetworkEntity.constructorTypes.has('Client' + typeName)) {
                    resolvedType = 'Client' + typeName;
                } else {
                    throw new ReferenceError(`Type ${typeName} is not a valid network entity constructor type`);
                }
            }

            return NetworkEntity.constructorTypes.get(resolvedType);
        }

        /**
         * Retrieve a network entity constructor based on name
         * @param typeName
         * @returns {undefined|V|V}
         */
        static getLookupType(typeName) {
            let resolvedType = typeName;
            if(NetworkEntity.lookupTypes.has(typeName) === false) {
                if (NetworkEntity.lookupTypes.has('Client' + typeName)) {
                    resolvedType = 'Client' + typeName;
                } else {
                    throw new ReferenceError(`Type ${typeName} is not a valid network entity lookup type`);
                }
            }

            return NetworkEntity.lookupTypes.get(resolvedType);
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
                const serverType = type.name.replace('Client', '');
                return Connection.getSocket().request(IOEvent.syncNetworkEntity, {type: serverType, id: id})
                    .then(NetworkEntity.reconstruct);
            }
        }

        static localEntityExists(type, id) {
            return NetworkEntity.entities.get(type.name).has(id);
        }

        /**
         * Syncs the values of a map to the given array
         * @param map {Map}
         * @param arr {Array}
         */
        static syncValueList(map, arr) {
            arr.length = 0;
            const it = map.values();
            let item = it.next();
            while (item.done === false) {
                arr.push(item.value);
                item = it.next();
            }

            $rootScope.$evalAsync();
        }

        /**
         * Parses a response to rebuild a network entity
         * @param data
         * @returns {NetworkEntity}
         */
        static reconstruct(data) {
            const type = NetworkEntity.getLookupType(data.type);
            let entity = null;
            if(NetworkEntity.localEntityExists(type, data.id) === true) {
                entity = NetworkEntity.entities.get(type.name).get(data.id);
                entity.sync(data.params);
            } else {
                const ctorType = NetworkEntity.getConstructorType(data.type);
                entity = new ctorType(data.params);
                entity.sync(data.params);
                NetworkEntity.entities.get(type.name).set(data.id, entity);
            }

            return entity;
        }
    }

    NetworkEntity.lookupTypes      = new Map(); // Mapping of types to use for entity look ups
    NetworkEntity.constructorTypes = new Map(); // Types to use when reconstructing entities
    NetworkEntity.entities         = new Map(); // Collection of all synced entities

    Connection.ready().then(socket => {
        socket.get().on(IOEvent.syncNetworkEntity, NetworkEntity.reconstruct);
    });

    return NetworkEntity;
}