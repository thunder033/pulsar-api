'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

function LobbyCtrl(Socket, $scope, User) {
    $scope.status = 'loading';
    $scope.matches = [];
    $scope.user = null;
    $scope.fields = {
        matchLabel: ''
    };

    // creates a callback to assign a value to the scope
    function assignScope(property) {
        return function(value) {
            $scope[property] = value;
        }
    }

    Socket.on('connect', () => $scope.status = 'connected');

    Socket.on('joinedRoom', (room) => {
        $scope.room = room;
        $scope.status = 'ready';
    });

    Socket.on('matchListUpdate', (matchList) => {
        $scope.matches.length = 0;
        $scope.matches.push.apply($scope.matches, matchList);
    });

    Socket.on('matchCreated', (match) => {
        $scope.matches.push(match);
    });

    Socket.on('serverError', (err) => $scope.errorMessage = err.message);

    $scope.joinLobby = function(username) {
        if(username.length > 0) {
            $scope.user = new User(username, Socket);
            Socket.emit('join', {name: username});
            $scope.status = 'loading';
        }
    };

    $scope.createMatch = function(matchName){
        if(matchName.length > 0) {
            Socket.emit('requestMatch', {label: matchName});
        }
    }
}

module.exports = LobbyCtrl;