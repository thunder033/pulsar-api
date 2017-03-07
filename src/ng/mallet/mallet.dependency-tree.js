/**
 * Provide accurate, quick access to full list of mallet dependencies
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const MDP = {
    ng: {
        $location: '$location',
        $scope: '$scope',
        $rootScope: '$rootScope',
        $q: '$q',
        $state: '$state',
        $socket: 'socketFactory'
    },
    config: {
        Path: 'config.Path'
    },
    AsyncRequest: 'mallet.AsyncRequest',
    Camera: 'mallet.Camera',
    Color: 'mallet.Color',
    mEasel: 'mEasel',
    Easel: 'mallet.Easel',
    Geometry: 'mallet.Geometry',
    Keyboard: 'mallet.Keyboard',
    Log: 'mallet.Log',
    Math: 'mallet.Math',
    MouseUtils: 'mallet.MouseUtils',
    ParticleEmitter: 'mallet.ParticleEmitter',
    ParticleEmitter2D: 'mallet.ParticleEmitter2D',
    Scheduler: 'mallet.Scheduler',
    State: 'mallet.State',
    StateMachine:'mallet.StateMachine',
    Thread: 'mallet.Thread',
};
const mallet = MDP;

module.exports = {MDP};