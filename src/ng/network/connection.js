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
 * @param Socket
 * @returns {ClientConnection}
 */
function connectionFactory($q, Socket) {

    const ready = $q.defer();
    /**
     * Maintains a connection to the server
     */
    class ClientConnection extends EventTarget {

        constructor() {
            super();
            this.user = null;
            this.connected = ready.promise;
        }

        ready() {
            return this.connected.then(() => this.socket);
        }

        /**
         * Authenticates with the given credientials and retrieves the user
         * @param credentials
         */
        authenticate(credentials) {
            this.socket = new Socket(credentials);
            this.socket.get().on(IOEvent.connect, ready.resolve);
            return this.connected.then(() => {

            });
        }

        getSocket() {
            if (this.socket === null) {
                throw new Error('Cannot access connection before authentication');
            }

            return this.socket;
        }

        getUser() {
            return this.user;
        }
    }

    return new ClientConnection();
}

module.exports = connectionFactory;