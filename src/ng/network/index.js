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
    'simple-request.HttpConfig',
    require('./socket-factory')]);

network.factory('network.NetworkEntity', [
    'network.Connection',
    '$q',
    require('./network-entity')]);

network.factory('network.Connection', [
    '$q',
    'network.Socket',
    require('./connection')]);

network.factory('network.User', [
    'network.NetworkEntity',
    'network.Connection',
    require('./user-factory')]);

network.factory('network.ClientRoom', [
    'network.Connection',
    'network.NetworkEntity',
    'network.User',
    require('./client-room')]);

module.exports = network;