'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const lobby = require('./lobby');
const network = require('./network');
const game = require('./game');

const angular = require('angular');
require('angular-q-spread');

angular.module('warp-test-client', [
    network.name,
    lobby.name,
    game.name,
    require('angular-ui-router'),
    '$q-spread',
]).config(['$stateProvider','$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/lobby');

    $stateProvider.state('lobby', {
        url: '/lobby',
        templateUrl: 'views/lobby.html',
        controller: 'lobby.LobbyCtrl'
    });
}]);
