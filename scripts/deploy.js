/**
 * Deploys the build artifact to heroku
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const deploy = require('heroku-deploy-tarball');

const config = {
    app: 'pulsar-api',
    tarball: 'dist.tar.gz'
};

deploy(config);