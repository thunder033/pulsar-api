'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const lobby = require('angular')
    .module('client.lobby', []);

lobby.factory('lobby.Match', [
    'network.Socket',
    require('./match-factory')]);

lobby.controller('lobby.LobbyCtrl', [
    'network.Socket',
    '$scope',
    'network.User',
    'lobby.Match',
    require('./lobby-ctrl')]);

module.exports = lobby;