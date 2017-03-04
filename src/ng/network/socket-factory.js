'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const IOEvent = require('event-types').IOEvent;

function socketFactory($socket, $q, HttpConfig) {

    class Socket {

        constructor(credentials) {
            const io = require('socket.io-client')(`http://${location.host}`, {query: HttpConfig.getQueryString(credentials)});
            const ioSocket = io.connect();

            this.socket = $socket({ioSocket: ioSocket});
        }

        /**
         *
         * @param event {string}: event to trigger
         * @param body {any}: data to send
         * @param timeoutDuration=3000 {number}: milliseconds before request fails
         * @returns {Promise}
         */
        request(event, body, timeoutDuration = 3000) {
            return $q((resolve, reject) => {
                const id = ~~(Math.random() * 100000);
                this.socket.emit(event, {reqId: id, body});

                let timer = null;
                if(typeof timeoutDuration === 'number') {
                    timer = setTimeout(()=>reject('Request Timed Out'), timeoutDuration);
                }

                const responseKey = `${event}-${id}`;
                const errorKey = `${IOEvent.serverError}-${id}`;

                function endRequest(socket) {
                    socket.removeAllListeners(responseKey);
                    socket.removeAllListeners(errorKey);
                    clearTimeout(timer);
                }

                this.socket.on(responseKey, (data) => {
                    endRequest(this.socket);
                    resolve(data);
                });

                this.socket.on(errorKey, (err) => {
                    endRequest(this.socket);
                    reject(err);
                })
            });
        }

        get(){
            return this.socket;
        }
    }

    return Socket;
}

module.exports = socketFactory;