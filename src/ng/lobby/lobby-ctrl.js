'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const IOEvent = require('event-types').IOEvent;
const MatchEvent = require('event-types').MatchEvent;

function LobbyCtrl(Socket, $scope, User, Match) {
    $scope.status = 'loading';

    // reference to match list that is updated by factory
    $scope.matches = Match.getMatchSet();
    $scope.user = null;
    $scope.fields = {
        username: '',
        matchLabel: ''
    };

    // creates a callback to assign a value to the scope
    function assignScope(property) {
        return function(value) {
            $scope[property] = value;
        }
    }

    Socket.on(IOEvent.connect, () => $scope.status = 'connected');

    Socket.on(IOEvent.joinedRoom, (room) => {
        $scope.room = room;
        $scope.status = 'ready';
    });

    Socket.on(IOEvent.serverError, (err) => $scope.errorMessage = err.message);

    $scope.joinLobby = function(username) {
        if(username.length > 0) {
            $scope.user = new User(username, Socket);
            Socket.emit(IOEvent.join, {name: username});
            $scope.status = 'loading';
        }
    };

    $scope.createMatch = function(matchName){
        if(matchName.length > 0) {
            Socket.emit(MatchEvent.requestMatch, {label: matchName});
        }
    }
}

module.exports = LobbyCtrl;