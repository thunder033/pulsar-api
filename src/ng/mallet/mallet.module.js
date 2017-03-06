/**
 * Created by Greg on 11/27/2016.
 */
'use strict';
var math = require('./math.svc'),
    config = require('../config.module'),
    constants = require('./mallet.constants'),
    simpleRequest = require('../shared/simple-request');

/**
 * Library for interactive web apps
 * @module mallet
 */
var mallet = require('angular')
    .module('mallet', [
        config.name,
        constants.name,
        math.name,
        simpleRequest.name]);

//Core
require('./state.svc');
require('./scheduler.svc');
require('./thread.factory');
require('./async-request.factory');

//Input
require('./keys.svc');
require('./mouse-utils.svc');

//3D Rendering
require('./camera.svc');
require('./geometry.svc');
require('./particle-emitter.factory');

//Canvas Wrapper
require('./color.svc');
require('./easel.directive');
require('./easel.svc');
require('./particle-emitter-2d.svc');

module.exports = mallet;