/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
const MDT = require('../mallet/mallet.dependency-tree').MDT;
const GameEvent = require('event-types').GameEvent;

module.exports = {FluxCtrl,
resolve: ADT => [
    ADT.ng.$scope,
    MDT.Scheduler,
    MDT.Camera,
    MDT.Geometry,
    MDT.Math,
    MDT.Easel,
    MDT.Keyboard,
    MDT.const.Keys,
    FluxCtrl]};

function FluxCtrl($scope, MScheduler, MCamera, Geometry, MM, MEasel, Keyboard, Keys) {
    function init() {
        const tCube = new Geometry.Transform();
        tCube.scale.scale(0.5);

        const players = $scope.warpGame.getPlayers();
        let clientShip = null;
        console.log($scope.clientUser);
        const ships = players.map((player) => {
            console.log('check user', player.getUser());
            if (player.getUser() === $scope.clientUser) {
                clientShip = player.getShip();
            }
            return player.getShip();
        });

        console.log(ships);
        console.log(clientShip);
        $scope.posX = 0;

        Keyboard.onKeyDown(Keys.Left, () => clientShip.strafe(-1));
        Keyboard.onKeyDown(Keys.Right, () => clientShip.strafe(1));

        Keyboard.onKeyUp(Keys.Left, () => clientShip.strafe(0));
        Keyboard.onKeyUp(Keys.Right, () => clientShip.strafe(0));

        MScheduler.schedule((dt) => {
            const rot = (~~performance.now()) / 200;
            tCube.rotation.x = rot;
            tCube.rotation.y = rot;
            tCube.rotation.z = rot;
            $scope.posX = clientShip.getTransform().position.x.toFixed(3);
            $scope.lossPct = ~~(clientShip.getDataLoss() * 100);
            $scope.updateTime = clientShip.getUpdateTime();

            MScheduler.draw(() => {
                MCamera.render(
                    Geometry.meshes.Ship,
                    ships.map(s => s.getTransform()),
                    MM.vec3(255));

                MCamera.render(Geometry.meshes.Cube, [tCube], MM.vec3(255, 0, 0));
                MCamera.present();
            });
        });
    }

    $scope.$on(GameEvent.playStarted, init);
}
