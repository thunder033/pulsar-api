'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */
const network = require('../network');
const game = require('../game');

const ADP = require('../app.dependency-tree.js').ADP;

ADP.lobby = {
    LobbyCtrl: 'lobby.LobbyCtrl',
    stagingMatch: 'stagingMatch'
};

const lobby = require('angular')
    .module('client.lobby', [network.name, game.name]);

lobby.controller(ADP.lobby.LobbyCtrl, require('./lobby-ctrl').resolve(ADP));
lobby.directive(ADP.lobby.stagingMatch, require('./match-directive').resolve(ADP));

module.exports = lobby;
