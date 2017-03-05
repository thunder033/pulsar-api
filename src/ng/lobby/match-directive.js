/**
 * Display details about a match while waiting for enough users
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const MatchEvent = require('event-types').MatchEvent;
const IOEvent = require('event-types').IOEvent;

module.exports = function (ClientMatch) {
    return {
        restrict: 'E',
        scope: {
            match: '='
        },
        templateUrl: 'views/staging-match.html',
        controller: ['$scope', 'network.Client', function StagingMatchCtrl($scope, Client) {

            $scope.isHost = function(user) {
                return $scope.match.getHost() === user;
            };

            $scope.startMatch = function() {
                Client.emit(MatchEvent.requestStart, {matchId: $scope.match.getId()});
            };

            $scope.leaveMatch = function() {
                Client.emit(MatchEvent.requestLeave);
            };

            const arrMaxSize = new Array(ClientMatch.MAX_MATCH_SIZE);
            $scope.getMaxSize = function () {
                return arrMaxSize;
            }
        }]
    };
};