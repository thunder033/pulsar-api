'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

function PlayCtrl(MScheduler, MCamera, Geometry, MM, MEasel, $stateParams, NetworkEntity, $scope, $timeout, ClientRoom) {

    const gameState = {
        LOADING: 0,
        SYNCING: 1,
        PLAYING: 2,
        ENDED: 4
    };

    $scope.states = gameState;
    $scope.state = gameState.LOADING;
    $scope.secondsToStart = NaN;

    function initGame() {
        const tCube = new Geometry.Transform();
        MScheduler.schedule(() => {

            tCube.rotation.x =
            tCube.rotation.y =
            tCube.rotation.z = (~~performance.now()) / 200;

            MScheduler.draw(() => {
                MEasel.context.canvas.style.background = '#fff';
                MCamera.render(Geometry.meshes.Cube, [tCube], MM.vec3(255, 0, 0));
                MCamera.present();
            });
        });
    }


    function startGame() {
        $scope.state = gameState.PLAYING;
        $timeout(initGame);

        const startTime = (new Date()).getTime();
        console.log(`start play at ${startTime}`);
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
        });

}

module.exports = PlayCtrl;