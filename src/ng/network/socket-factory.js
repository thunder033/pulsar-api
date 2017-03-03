'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

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
                this.socket.on(responseKey, (data) => {
                    this.socket.removeAllListeners(responseKey);
                    clearTimeout(timer);
                    resolve(data);
                });
            });
        }

        get(){
            return this.socket;
        }
    }

    return Socket;
}

module.exports = socketFactory;