'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

function LobbyCtrl(Socket, $scope) {
    $scope.status = 'loading';
    $scope.matches = [];

    Socket.on('connect', () => {
        Socket.emit('join', {name: Math.random().toString()});
        $scope.status = 'connected'
    });

    Socket.on('joinedRoom', (room) => {
        $scope.room = room;
        $scope.status = 'ready';
    });

    Socket.on('matchCreated', (match) => {
        $scope.matches.push(match);
    });

    $scope.createMatch = function(){
        Socket.emit('requestMatch', 'testMatch');
    }
}

module.exports = LobbyCtrl;