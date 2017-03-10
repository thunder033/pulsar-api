/**
 * Display details about a match while waiting for enough users
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
const MatchEvent = require('event-types').MatchEvent;

module.exports = {matchDirective,
resolve: ADT => [
    ADT.game.ClientMatch,
    matchDirective]};

function matchDirective(ClientMatch) {
    return {
        restrict: 'E',
        scope: {
            match: '=',
        },
        templateUrl: 'views/staging-match.html',
        controller: ['$scope', 'network.Client', function StagingMatchCtrl($scope, Client) {

            $scope.isHost = function isHost(user) {
                return $scope.match.getHost() === user;
            };

            $scope.startMatch = function startMatch() {
                Client.emit(MatchEvent.requestStart, {matchId: $scope.match.getId()});
            };

            $scope.leaveMatch = function leaveMatch() {
                Client.emit(MatchEvent.requestLeave);
            };

            const arrMaxSize = new Array(ClientMatch.MAX_MATCH_SIZE);
            $scope.getMaxSize = function getMaxSize() {
                return arrMaxSize;
            };
        }],
    };
}
