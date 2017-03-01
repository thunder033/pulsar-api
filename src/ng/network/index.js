'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

// this module needs an angular reference
const angular = require('angular');
const simpleRequest = require('./simple-request');
require('angular-socket-io');

const network = angular.module('network', [
    'btford.socket-io',
    simpleRequest.name
]);

network.factory('network.Socket', [
    'socketFactory',
    '$q',
    'simple-request.SimpleSocket',
    require('./socket-factory')]);

network.factory('network.NetworkEntity', [
    require('./network-entity')]);

network.factory('network.Connection', [
    '$q',
    'simple-request.SimpleSocket',
    'network.NetworkEntity',
    require('./connection')]);

network.factory('network.User', [
    'network.NetworkEntity',
    require('./user-factory')]);

network.factory('network.ClientRoom', [
   'network.Socket',
    require('./client-room')]);

module.exports = network;