/**
 * Deploys the build artifact to heroku
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const deploy = require('heroku-deploy-tarball');

const tarball = 'dist.tar.gz';
const config = {
    master    : {tarball, app: 'pulsar-api-stage'},
    production: {tarball, app: 'pulsar-api'},
    prototype1: {tarball, app: 'pulsar-api-p1',},
    release1  : {tarball, app: 'pulsar-api-r1'},
};

deploy(config[process.env.CIRCLE_BRANCH || 'master']);