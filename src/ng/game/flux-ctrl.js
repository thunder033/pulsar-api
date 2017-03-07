/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const MDP = require('../mallet/mallet.dependency-tree').MDP;
const GameEvent = require('event-types').GameEvent;

module.exports = {FluxCtrl, resolve(ADP){return [
    ADP.ng.$scope,
    MDP.Scheduler,
    MDP.Camera,
    MDP.Geometry,
    MDP.Math,
    MDP.Easel,
    FluxCtrl]}};

function FluxCtrl($scope, MScheduler, MCamera, Geometry, MM, MEasel) {
    function init() {
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

    $scope.$on(GameEvent.playStarted, init);
}
