'use strict';
/// <reference path='../node_modules/@types/node/index.d.ts' />
/**
 * Created by gjrwcs on 2/16/2017.
 */

import {ExpressServer} from './express-server';
import {SyncServer} from './sync-server';
import {MatchMaker} from './match-maker';

const HTTP_ROUTES = {
    '/': 'public/index.html',
    '/dist/bundle.js': 'public/dist/bundle.js',
    '/views/lobby.html': 'public/views/lobby.html',
};

// init the application
const httpServer = new ExpressServer(HTTP_ROUTES);
// Create a new sync server
const syncServer = new SyncServer(httpServer.getServer());

// Add Components that define server functionality
syncServer.addComponent(MatchMaker);
