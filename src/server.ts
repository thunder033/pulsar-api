'use strict';
/// <reference path="../node_modules/@types/node/index.d.ts" />
/**
 * Created by gjrwcs on 2/16/2017.
 */

import {ExpressServer} from './express-server';
import {SyncServer} from './sync-server';

const HTTP_ROUTES = {
    '/': 'client/index.html',
    '/priority-queue.js': 'src/priority-queue.js',
    '/utility.js': 'client/utility.js',
};

// init the application
const httpServer = new ExpressServer(HTTP_ROUTES);
// Create a new sync server
const syncServer = new SyncServer(httpServer.getServer());
