'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const lobby = require('./lobby');
const network = require('./network');

require('angular').module('warp-test-client', [
    network.name,
    lobby.name,
    require('angular-ui-router'),
    'btford.socket-io'
]).config(['$stateProvider','$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise('/lobby');

    $stateProvider.state('lobby', {
        url: '/lobby',
        templateUrl: 'views/lobby.html',
        controller: 'lobby.LobbyCtrl'
    });
}]);
