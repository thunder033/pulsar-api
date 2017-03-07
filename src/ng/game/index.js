/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const ADP = require('../app.dependency-tree.js').ADP;

ADP.game = {
    Player: 'game.Player',
    ClientMatch: 'game.ClientMatch',
    PlayCtrl: 'game.PlayCtrl'
    FluxCtrl: 'game.FluxCtrl',
};

const game = require('angular')
    .module('game', [
        require('../network').name
    ]);

game.factory(ADP.game.Player, [
    'network.User',
    'network.ClientRoom',
    'game.ClientMatch',
    require('./player')]);

game.factory(ADP.game.ClientMatch, require('./client-match').resolve(ADP));
game.controller(ADP.game.PlayCtrl, require('./play-ctrl').resolve(ADP));
game.controller(ADP.game.FluxCtrl, require('./flux-ctrl').resolve(ADP));

module.exports = game;