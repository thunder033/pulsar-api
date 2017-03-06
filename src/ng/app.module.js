'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

window.PriorityQueue = require('../priority-queue').PriorityQueue;
const lobby = require('./lobby');
const network = require('./network');
const game = require('./game');
const mallet = require('./mallet');


const angular = require('angular');
require('angular-q-spread');

angular.module('warp-test-client', [
    network.name,
    lobby.name,
    game.name,
    mallet.name,
    require('angular-ui-router'),
    '$q-spread',
]).config(['$stateProvider','$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/lobby');

    $stateProvider.state('lobby', {
        url: '/lobby',
        templateUrl: 'views/lobby.html',
        controller: 'lobby.LobbyCtrl'
    });
}]).run(['MScheduler', function(MScheduler){
    MScheduler.startMainLoop();
}]);
