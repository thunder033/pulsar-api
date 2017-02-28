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
    'network.Socket',
    'network.ClientRoom',
    'network.User',
    require('./client-match')]);

module.exports = game;