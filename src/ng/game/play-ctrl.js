'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const GameEvent = require('event-types').GameEvent;
const MatchEvent = require('event-types').MatchEvent;

module.exports = {PlayCtrl,
resolve: ADT => [
    ADT.ng.$stateParams,
    ADT.network.NetworkEntity,
    ADT.ng.$scope,
    ADT.ng.$timeout,
    ADT.network.ClientRoom,
    ADT.ng.$state,
    ADT.network.Client,
    ADT.network.Clock,
    ADT.game.WarpGame,
    PlayCtrl]};

/**
 *
 * @param $stateParams
 * @param NetworkEntity {NetworkEntity}
 * @param $scope
 * @param $timeout
 * @param ClientRoom {ClientRoom}
 * @param $state
 * @param Client {Client}
 * @param Clock {Clock}
 * @param WarpGame {WarpGame}
 * @constructor
 */
function PlayCtrl($stateParams, NetworkEntity, $scope, $timeout, ClientRoom, $state, Client, Clock, WarpGame) {
    const gameState = {
        LOADING: 0,
        SYNCING: 1,
        PLAYING: 2,
        ENDED: 4,
    };

    $scope.states = gameState;
    $scope.state = gameState.LOADING;
    $scope.secondsToStart = NaN;
    $scope.match = null;

    function startGame() {
        $scope.state = gameState.PLAYING;
        $timeout(() => $scope.$broadcast(GameEvent.playStarted));

        const startTime = Clock.getNow();
        console.log(`start play at ${startTime}`);
    }

    $scope.endGame =  function endGame() {
        $scope.state = gameState.ENDED;
        Client.emit(MatchEvent.requestEnd);
    };

    Client.addEventListener(MatchEvent.matchEnded, () => {
        $state.go('results', {matchId: $scope.match.getId()});
    });

    NetworkEntity.getById(ClientRoom, $stateParams.matchId)
        .then((match) => {
            if (!match) {
                console.error(`No match was found with match id: ${$stateParams.matchId}`);
                $state.go('lobby');
                return;
            }

            $scope.match = match;
            $scope.state = gameState.SYNCING;
            $scope.warpGame = new WarpGame(match);
            const remainingStartTime = match.getStartTime() - Clock.getNow();

            $scope.secondsToStart = ~~(remainingStartTime / 1000);
            const countdownInterval = setInterval(() => {
                $scope.secondsToStart = Math.max($scope.secondsToStart - 1, 0);
            }, 1000);

            setTimeout(() => {
                startGame();
                clearInterval(countdownInterval);
            }, remainingStartTime);
        }).catch((e) => {
        console.error(e);
        $state.go('lobby');
    });
}
