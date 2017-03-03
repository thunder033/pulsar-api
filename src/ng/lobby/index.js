'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const lobby = require('angular')
    .module('client.lobby', []);

lobby.controller('lobby.LobbyCtrl', [
    'network.Connection',
    '$scope',
    'game.ClientMatch',
    'network.ClientRoom',
    require('./lobby-ctrl')]);

lobby.directive('stagingMatch', [
    'game.ClientMatch',
    require('./match-directive')]);

module.exports = lobby;