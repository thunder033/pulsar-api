/**
 * Deploys the build artifact to heroku
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const deploy = require('heroku-deploy-tarball');

const config = {
    master: {
        app: 'pulsar-api-stage',
        tarball: 'dist.tar.gz'
    },
    production: {
        app: 'pulsar-api',
        tarball: 'dist.tar.gz'
    },
    prototype1: {
        app: 'pulsar-api-p1',
        tarball: 'dist.tar.gz'
    },
    release1: {
        app: 'pulsar-api-r1',
        tarball: 'dist.tar.gz'
    },
};

deploy(config[process.env.CIRCLE_BRANCH || 'master']);