/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const IOEvent = require('event-types').IOEvent;
const EventTarget = require('eventtarget');

module.exports = {networkEntityFactory,
resolve: ADT => [
    ADT.network.Connection,
    ADT.ng.$q,
    ADT.ng.$rootScope,
    networkEntityFactory]};

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

        sync(params) {
            Object.assign(this, params);
            this.syncTime = ~~performance.now();

            console.log(`sync ${this.constructor.name} ${this.id} at ${this.syncTime}`);
            $rootScope.$evalAsync();
        }

        static registerType(type) {
            let baseType = type;
            NetworkEntity.lookupTypes.forEach((candidateType) => {
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
                if (NetworkEntity.constructorTypes.has(`Client${typeName}`)) {
                    resolvedType = `Client${typeName}`;
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
            if (NetworkEntity.lookupTypes.has(typeName) === false) {
                if (NetworkEntity.lookupTypes.has(`Client${typeName}`)) {
                    resolvedType = `Client${typeName}`;
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
            if (!type || typeof id !== 'string') {
                throw new Error('Network entities must be identified by both type and name');
            }

            const lookupType = NetworkEntity.getLookupType(type.name);

            if (NetworkEntity.localEntityExists(lookupType, id) === true) {
                // console.log('use local copy ', id);
                return $q.when(NetworkEntity.entities.get(lookupType.name).get(id));
            } else if (NetworkEntity.pendingRequests.has(id)) {
                console.log('use pending ', id);
                return NetworkEntity.pendingRequests.get(id);
            }

            console.log('request ', id);
            const serverType = type.name.replace('Client', '');
            const request = Connection.getSocket()
                .request(IOEvent.syncNetworkEntity, {type: serverType, id})
                .then(NetworkEntity.reconstruct);
            NetworkEntity.pendingRequests.set(id, request);
            return request;
        }

        /**
         * Indicates if the entity identified by the registered type and name exists locally
         * @param type {any}
         * @param id {string}
         */
        static localEntityExists(type, id) {
            try {
                return NetworkEntity.entities.get(type.name).has(id);
            } catch (e) {
                if(NetworkEntity.getLookupType(type.name)) {
                    throw new Error(`Could not complete look up: ${e.message || e}`);
                }
            }

        }

        /**
         * Syncs the values of a map to the given array
         * @param map {Map}
         * @param arr {Array}
         */
        static syncValueList(map, arr) {
            /* eslint no-param-reassign: off */
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
         * @returns {Promise<NetworkEntity>}
         */
        static reconstruct(data) {
            const type = NetworkEntity.getLookupType(data.type);
            let entity = null;
            if (NetworkEntity.localEntityExists(type, data.id) === true) {
                entity = NetworkEntity.entities.get(type.name).get(data.id);
            } else {
                console.log('construct ', data.id);
                const ctorType = NetworkEntity.getConstructorType(data.type);
                /* eslint new-cap: off */
                entity = new ctorType(data.params);
                NetworkEntity.entities.get(type.name).set(data.id, entity);
            }

            if (NetworkEntity.pendingRequests.has(entity.id)) {
                NetworkEntity.pendingRequests.delete(entity.id);
            }

            return $q.when(entity.sync(data.params)).then(() => entity);
        }
    }

    NetworkEntity.lookupTypes      = new Map(); // Mapping of types to use for entity look ups
    NetworkEntity.constructorTypes = new Map(); // Types to use when reconstructing entities
    NetworkEntity.entities         = new Map(); // Collection of all synced entities
    NetworkEntity.pendingRequests  = new Map(); // Map of pending sync requests

    // noinspection JSAnnotator
    NetworkEntity.ID_LENGTH = 36;

    Connection.ready().then((socket) => {
        socket.get().on(IOEvent.syncNetworkEntity, NetworkEntity.reconstruct);
    });

    return NetworkEntity;
}