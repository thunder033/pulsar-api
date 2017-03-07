/**
 * The intent of Application Dependency Tree is to provide easy (auto-completed!) access
 * to full module dependency names. This speeds typing and ensures accuracy.
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const ADP = {
    ng: {
        $scope: '$scope',
        $rootScope: '$rootScope',
        $q: '$q',
        $state: '$state',
        $socket: 'socketFactory',
        $stateParams: '$stateParams'
    }
};

/** @type MDP **/
ADP.mallet = require('./mallet/mallet.dependency-tree').MDP;

module.exports = {ADP};