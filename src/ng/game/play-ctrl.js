'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const GameEvent = require('event-types').GameEvent;
module.exports = {PlayCtrl, resolve(ADP){return [
    ADP.ng.$stateParams,
    ADP.network.NetworkEntity,
    ADP.ng.$scope,
    ADP.ng.$timeout,
    ADP.network.ClientRoom,
    ADP.ng.$state,
    ADP.network.Client,
    PlayCtrl]}};


function PlayCtrl($stateParams, NetworkEntity, $scope, $timeout, ClientRoom, $state, Client) {

    const gameState = {
        LOADING: 0,
        SYNCING: 1,
        PLAYING: 2,
        ENDED: 4
    };

    $scope.states = gameState;
    $scope.state = gameState.LOADING;
    $scope.secondsToStart = NaN;
    $scope.match = null;

    function startGame() {
        $scope.state = gameState.PLAYING;
        $timeout(()=>$scope.$broadcast(GameEvent.playStarted));

        const startTime = (new Date()).getTime();
        console.log(`start play at ${startTime}`);
    }

    function endGame() {
        $scope.state = gameState.ENDED;

    }

    NetworkEntity.getById(ClientRoom, $stateParams.matchId)
        .then(match => {
            if(!match) {
                console.error(`No match was found match id: ${$stateParams.matchId}`);
                return;
            }

            $scope.match = match;
            $scope.state = gameState.SYNCING;
            const remainingStartTime = match.getStartTime() - (new Date()).getTime();

            $scope.secondsToStart = ~~(remainingStartTime/1000);
            const countdownInterval = setInterval(() => {
                $scope.secondsToStart = Math.max($scope.secondsToStart - 1, 0);
            }, 1000);

            setTimeout(() => {
                startGame();
                clearInterval(countdownInterval);
            }, remainingStartTime);
        }).catch((e) => {
        console.error(e);
        $state.go('lobby')
    });

}
