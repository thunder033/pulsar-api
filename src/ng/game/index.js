/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const game = require('angular')
    .module('game', [
        require('../network').name,
        require('../lobby').name
    ]);

game.factory('game.Player', [
    'network.User',
    'network.ClientRoom',
    'game.ClientMatch',
    require('./player')
]);

game.factory('game.ClientMatch', [
    'network.Connection',
    'network.ClientRoom',
    'network.User',
    'network.NetworkEntity',
    '$rootScope',
    require('./client-match')]);

module.exports = game;