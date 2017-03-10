/**
 * Created by gjr8050 on 2/24/2017.
 */
const network = require('../network');
const game = require('../game');

const ADT = require('../app.dependency-tree.js').ADT;

ADT.lobby = {
    LobbyCtrl: 'lobby.LobbyCtrl',
    stagingMatch: 'stagingMatch',
};

const lobby = require('angular')
    .module('client.lobby', [network.name, game.name]);

lobby.controller(ADT.lobby.LobbyCtrl, require('./lobby-ctrl').resolve(ADT));
lobby.directive(ADT.lobby.stagingMatch, require('./match-directive').resolve(ADT));

module.exports = lobby;
