'use strict';
/// <reference path='../node_modules/@types/node/index.d.ts' />
/**
 * Created by gjrwcs on 2/16/2017.
 */
require('dotenv').load(); // tslint:disable-line:no-var-requires
import { setAliases } from './configure-aliases';
setAliases();

import {ExpressServer} from './express-server';
import {SyncServer} from './sync-server';
import {NetworkIndex} from './network-index';
import {MatchMaker} from './match-maker';
import {Building} from './building';
import {Simulator} from './simulation';
import {WarpFactory} from './warp';

const HTTP_ROUTES = {
    '/': 'public/index.html',
    '/assets/apiStructure.png': 'public/assets/apiStructure.png',
    '/assets/theme.css': 'public/assets/theme.css',
    '/assets/uiStructure.png': 'public/assets/uiStructure.png',
};

// init the application
const httpServer = new ExpressServer(HTTP_ROUTES);
// Create a new sync server
const syncServer = new SyncServer(httpServer.getServer());

// Add Components that define server functionality
syncServer.addComponent(Building);
syncServer.addComponent(NetworkIndex);
syncServer.addComponent(MatchMaker);
syncServer.addComponent(Simulator);
syncServer.addComponent(WarpFactory);
