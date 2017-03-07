'use strict';
const MDP = require('./mallet.dependency-tree').MDP;

MDP.const = {
    ScaleFactor: 'mallet.const.ScaleFactor',
    SampleCount: 'mallet.const.SampleCount',
    MaxFrameRate: 'mallet.const.MaxFrameRate',
    Keys: 'mallet.const.Keys',
};

const constants = require('angular').module('mallet-constants', [])
    //Rendering
    .constant(MDP.const.ScaleFactor, (()=>window.devicePixelRatio || 1)())
    .constant(MDP.const.SampleCount, 1024)
    .constant(MDP.const.MaxFrameRate, 60)
    .constant(MDP.const.Keys, Object.freeze({
        Down: 40,
        Up: 38,
        Right: 39,
        Left: 37,
        Space: 32,
        Escape: 27
    }));

module.exports = constants;