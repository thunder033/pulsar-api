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
    if (Client.getUser() === null) {
       return $state.go('lobby');
    }

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
    $scope.clientUser = null;

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

    NetworkEntity.getById(WarpGame, $stateParams.gameId)
        .then((game) => {
            if (!game) {
                console.error(`No game was found with game id: ${$stateParams.gameId}`);
                $state.go('lobby');
                return;
            }

            $scope.warpGame = game;
            $scope.clientUser = Client.getUser();
            $scope.match = game.getMatch();
            $scope.state = gameState.SYNCING;
            const remainingStartTime = $scope.match.getStartTime() - Clock.getNow();
            console.log(`start match in ${remainingStartTime}`);

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
