/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const IOEvent = require('event-types').IOEvent;
const EventTarget = require('eventtarget');

/**
 * Provides a connection entity
 * @param $q
 * @param SimpleSocket
 * @param NetworkEntity
 * @returns {Connection}
 */
function connectionFactory($q, SimpleSocket, NetworkEntity) {

    /**
     * Maintains a connection to the server
     */
    class Connection extends EventTarget {

        constructor(socket) {
            super();

            this.socket = socket;
            this.user = null;

            this.connected = $q((resolve, reject) => {
                socket.on(IOEvent.connect, resolve);
            });
        }

        ready() {
            return this.connected;
        }

        /**
         * Authenticates with the given credientials and retrieves the user
         * @param credentials
         */
        authenticate(credentials) {
            return SimpleSocket.request(this.socket, IOEvent.join, credentials)
                .then(NetworkEntity.reconstruct)
                .then(user => {
                    this.user = user;
                    return user;
                });
        }

        getUser() {
            return this.user;
        }

        getSocket() {
            return this.socket;
        }
    }

    return new Connection();
}

module.exports = connectionFactory;