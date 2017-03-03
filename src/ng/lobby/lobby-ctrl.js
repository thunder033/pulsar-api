'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const IOEvent = require('event-types').IOEvent;
const MatchEvent = require('event-types').MatchEvent;

function LobbyCtrl(Connection, $scope, ClientMatch, ClientRoom) {

    const status = {
        LOADING        : 0,
        UNAUTHENTICATED: 1,
        READY          : 2,
        STAGING        : 4,
    };

    $scope.curStatus = status.UNAUTHENTICATED;

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

    Connection.ready().then(() => $scope.curStatus = status.READY);

    // Socket.on(IOEvent.joinedRoom, (room) => {
    //     $scope.room = ClientRoom.getByName(room.name);
    //     if($scope.room.getName() === 'lobby') {
    //         $scope.curStatus = status.READY;
    //     } else {
    //         $scope.curStatus = status.STAGING;
    //     }
    // });

    //Socket.on(IOEvent.serverError, (err) => $scope.errorMessage = 'Error: ' + (err.message || err));

    $scope.authenticate = function(username) {
        if(username.length > 0) {
            Connection.authenticate({name: username})
                .then(assignScope('user'));
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