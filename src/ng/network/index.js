'use strict';
/**
 * Created by gjr8050 on 2/24/2017.
 */

const ADP = require('../app.dependency-tree.js').ADP;
// this module needs an angular reference
const angular = require('angular');
const simpleRequest = require('./simple-request');
require('angular-socket-io');

const network = angular.module('network', [
    'btford.socket-io',
    simpleRequest.name
]);


ADP.simpleRequest = {
    HttpConfig: 'simple-request.HttpConfig'
};

ADP.network = {
    AsyncInitializer: 'network.AsyncInitializer',
    Socket: 'network.Socket',
    NetworkEntity: 'network.NetworkEntity',
    Connection: 'network.Connection',
    User: 'network.User',
    ClientRoom: 'network.ClientRoom',
    Client: 'network.Client',
};

network.factory(ADP.network.Socket, require('./socket-factory').resolve(ADP));
network.factory(ADP.network.AsyncInitializer, require('./aysnc-initializer').resolve(ADP));
network.factory(ADP.network.NetworkEntity, require('./network-entity').resolve(ADP));
network.factory(ADP.network.Connection, require('./connection').resolve(ADP));
network.factory(ADP.network.User, require('./user-factory').resolve(ADP));
network.factory(ADP.network.ClientRoom, require('./client-room').resolve(ADP));
network.factory(ADP.network.Client, require('./client').resolve(ADP));

module.exports = network;
