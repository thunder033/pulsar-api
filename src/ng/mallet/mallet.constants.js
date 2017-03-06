'use strict';
var constants = require('angular').module('mallet-constants', [])
    //Rendering
    .constant('mallet.const.ScaleFactor', (()=>window.devicePixelRatio || 1)())
    .constant('mallet.const.SampleCount', 1024)
    .constant('mallet.const.MaxFrameRate', 60)
    .constant('mallet.const.MKeys', Object.freeze({
        Down: 40,
        Up: 38,
        Right: 39,
        Left: 37,
        Space: 32,
        Escape: 27
    }));

module.exports = constants;