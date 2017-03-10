/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const ADT = require('../app.dependency-tree.js').ADT;

ADT.game = {
    Player: 'game.Player',
    ClientMatch: 'game.ClientMatch',
    PlayCtrl: 'game.PlayCtrl',
    ResultsCtrl: 'game.ResultsCtrl',
    FluxCtrl: 'game.FluxCtrl',
    ClientShip: 'game.ClientShip',
};

const game = require('angular')
    .module('game', [
        require('../network').name
    ]);

game.factory(ADT.game.Player, [
    'network.User',
    'network.ClientRoom',
    'game.ClientMatch',
    require('./player')]);

game.factory(ADT.game.ClientMatch, require('./client-match').resolve(ADT));
game.controller(ADT.game.PlayCtrl, require('./play-ctrl').resolve(ADT));
game.controller(ADT.game.ResultsCtrl, require('./results-ctrl').resolve(ADT));
game.controller(ADT.game.FluxCtrl, require('./flux-ctrl').resolve(ADT));
game.factory(ADT.game.Player, require('./player').resolve(ADT));
game.factory(ADT.game.ClientShip, require('./client-ship').resolve(ADT));

module.exports = game;