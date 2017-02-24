'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

// this module needs an angular reference
const angular = require('angular');
require('angular-socket-io');

const network = angular.module('network', ['btford.socket-io']);

network.factory('network.Socket', [
    'socketFactory',
    require('./socket-factory')]);

module.exports = network;