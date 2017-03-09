'use strict';
/// <reference path='../node_modules/@types/node/index.d.ts' />
/**
 * Created by gjrwcs on 2/16/2017.
 */

import {ExpressServer} from './express-server';
import {SyncServer} from './sync-server';
import {MatchMaker} from './match-maker';
import {NetworkIndex} from './network-index';
import {Building} from './building';
import {Simulation} from './simulation';

const HTTP_ROUTES = {
    '/': 'public/index.html',
    '/assets/apiStructure.png': 'public/assets/apiStructure.png',
    '/assets/theme.css': 'public/assets/theme.css',
    '/assets/uiStructure.png': 'public/assets/uiStructure.png',
    '/dist/bundle.js': 'public/dist/bundle.js',
    '/views/lobby.html': 'public/views/lobby.html',
    '/views/play.html': 'public/views/play.html',
    '/views/results.html': 'public/views/results.html',
    '/views/staging-match.html': 'public/views/staging-match.html',
};

// init the application
const httpServer = new ExpressServer(HTTP_ROUTES);
// Create a new sync server
const syncServer = new SyncServer(httpServer.getServer());

// Add Components that define server functionality
syncServer.addComponent(Building);
syncServer.addComponent(NetworkIndex);
syncServer.addComponent(MatchMaker);
syncServer.addComponent(Simulation);
