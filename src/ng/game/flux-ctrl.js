/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
const MDT = require('../mallet/mallet.dependency-tree').MDT;
const GameEvent = require('event-types').GameEvent;

module.exports = {FluxCtrl, resolve(ADT){return [
    ADT.ng.$scope,
    MDT.Scheduler,
    MDT.Camera,
    MDT.Geometry,
    MDT.Math,
    MDT.Easel,
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
