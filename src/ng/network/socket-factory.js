'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */


function Socket(socketFactory) {
    const io = require('socket.io-client')();
    const socket = io.connect();

    return socketFactory({ioSocket: socket});
}

module.exports = Socket;