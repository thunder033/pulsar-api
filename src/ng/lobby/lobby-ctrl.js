'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const IOEvent = require('event-types').IOEvent;
const MatchEvent = require('event-types').MatchEvent;

function LobbyCtrl(Socket, $scope, Player, ClientMatch, ClientRoom) {

    const status = {
        LOADING: 0,
        CONNECTED: 1,
        READY: 2,
        STAGING: 4,
    };

    $scope.curStatus = status.LOADING;

    // reference to match list that is updated by factory
    $scope.matches = ClientMatch.getMatchSet();
    $scope.user = null;
    $scope.status = status;
    $scope.fields = {
        username: '',
        matchLabel: '',
        selectedMatch: null
    };

    // creates a callback to assign a value to the scope
    function assignScope(property) {
        return function(value) {
            $scope[property] = value;
        }
    }

    Socket.on(IOEvent.connect, () => $scope.curStatus = status.CONNECTED);

    Socket.on(IOEvent.joinedRoom, (room) => {
        $scope.room = ClientRoom.getByName(room.name);
        if($scope.room.getName() === 'lobby') {
            $scope.curStatus = status.READY;
        } else {
            $scope.curStatus = status.STAGING;
        }
    });

    Socket.on(IOEvent.serverError, (err) => $scope.errorMessage = 'Error: ' + (err.message || err));

    $scope.joinLobby = function(username) {
        if(username.length > 0) {
            $scope.user = new Player(username, Socket);
            Socket.emit(IOEvent.join, {name: username});
            $scope.curStatus = status.LOADING;
        }
    };

    $scope.joinMatch = function(name) {
        if(name && name.length > 0) {
            Socket.emit(MatchEvent.requestJoin, {name: name});
            $scope.curStatus = status.LOADING;
        }
    };

    $scope.createMatch = function(matchName){
        if(matchName && matchName.length > 0) {
            Socket.emit(MatchEvent.requestMatch, {label: matchName});
        }
    }
}

module.exports = LobbyCtrl;