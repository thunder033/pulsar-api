'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

function socketFactory($socket, $q) {

    class Socket {

        constructor(credentials) {
            const io = require('socket.io-client')();
            const ioSocket = io.connect(`http://${location.host}`, {query: encodeURIComponent(credentials)});

            this.socket = $socket({ioSocket: ioSocket});
        }

        /**
         *
         * @param event {string}: event to trigger
         * @param message {any}: data to send
         * @param timeoutDuration=3000 {number}: milliseconds before request fails
         * @returns {Promise}
         */
        request(event, message, timeoutDuration = 3000) {
            return $q((resolve, reject) => {
                const id = (Math.random() * 100000) % 100000;
                socket.emit(event, {_reqId: id, data: {message}});

                let timer = null;
                if(typeof timeoutDuration === 'number') {
                    timer = setTimeout(()=>reject('Request Timed Out'), timeoutDuration);
                }

                const responseKey = `${event}-${id}`;
                this.socket.on(responseKey, (data)=>{
                    clearTimeout(timer);
                    this.socket.off(responseKey);
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