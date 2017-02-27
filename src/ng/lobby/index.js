'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const lobby = require('angular')
    .module('client.lobby', []);

lobby.controller('lobby.LobbyCtrl', [
    'network.Socket',
    '$scope',
    'network.User',
    require('./lobby-ctrl')]);

module.exports = lobby;