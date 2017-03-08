/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const IOEvent = require('event-types').IOEvent;

module.exports = {connectionFactory, resolve(ADT){return [
    ADT.ng.$q,
    ADT.network.Socket,
    ADT.network.AsyncInitializer,
    ADT.network.Clock,
    connectionFactory];}};

/**
 * Provides a connection entity
 * @param $q
 * @param Socket
 * @param AsyncInitializer
 * @param Clock {Clock}
 * @returns {ClientConnection}
 */
function connectionFactory($q, Socket, AsyncInitializer, Clock) {

    const deferConnected = $q.defer();
    const deferJoined = $q.defer();

    /**
     * Maintains a connection to the server
     */
    class ClientConnection extends AsyncInitializer {

        constructor() {
            const joinEvt = new Event(IOEvent.joinServer);
            const joined = deferJoined.promise.then((userId) => {
                joinEvt.userId = userId;
                this.dispatchEvent(joinEvt);
            });

            super([deferConnected.promise, joined]);
            this.user = null;
            this.pingSamples = new Int8Array(60);
            this.pingInterval = null;
        }

        onPing(data) {
            this.pingSamples.push(Clock.getNow() - data.sent);
        }

        ping() {
            this.socket.get().emit(IOEvent.ping, {sent: Clock.getNow()});
        }

        /**
         * Add an operation to be resolved before the connection is ready to be used
         * @param promise
         */
        deferReady(promise) {
            this.readyAwait.push(promise);
            // short circuit the ready chain and replace it with a new promise
            this.readyHandle.resolve($q.all(this.readyAwait));
        }

        /**
         * Wait for any operations to complete that allow the connection to be used
         * @returns {Promise<void|T>|Promise<U>|*|Promise.<T>|Promise<void>}
         */
        ready() {
            console.log(`await ${this.readyAwait.length} operations...`);
            return this.readyChain
                .then(() => this.socket)
                .catch(e => console.error('Failed to establish Connection: ', e));
        }

        /**
         * Authenticates with the given credientials and retrieves the user
         * @param credentials
         */
        authenticate(credentials) {
            this.socket = new Socket(credentials);
            this.socket.get().on(IOEvent.connect, deferConnected.resolve);
            this.socket.get().on(IOEvent.joinServer, deferJoined.resolve);
            return this.ready().then(() => {
                return this.user;
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