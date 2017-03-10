/**
 * The Game module defines behavior for the game client
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const ADT = require('../app.dependency-tree.js').ADT;

ADT.game = {
    Player: 'game.Player',
    ClientMatch: 'game.ClientMatch',
    PlayCtrl: 'game.PlayCtrl',
    ResultsCtrl: 'game.ResultsCtrl',
    WarpCtrl: 'game.WarpCtrl',
    ClientShip: 'game.ClientShip',
    WarpGame: 'game.WarpGame',
};

const game = require('angular')
    .module('game', [
        require('../network').name,
    ]);

game.factory(ADT.game.ClientMatch, require('./client-match').resolve(ADT));
game.controller(ADT.game.PlayCtrl, require('./play-ctrl').resolve(ADT));
game.controller(ADT.game.ResultsCtrl, require('./results-ctrl').resolve(ADT));
game.controller(ADT.game.WarpCtrl, require('./flux-ctrl').resolve(ADT));
game.factory(ADT.game.ClientShip, require('./client-ship').resolve(ADT));
game.factory(ADT.game.Player, require('./player').resolve(ADT));
game.factory(ADT.game.WarpGame, require('./warp-game').resolve(ADT));


module.exports = game;
