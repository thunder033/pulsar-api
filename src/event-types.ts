/**
 * Created by Greg on 2/27/2017.
 */

import {Enum} from './enum';

/**
 * @property connect
 * @property serverError
 * @property joinServer
 * @property disconnect
 * @property roomCreated
 * @property joinedRoom
 * @property leftRoom
 * @property userDetailsUpdate
 * @property requestUserDetails
 * @property syncNetworkEntity
 */
export const IOEvent = Enum([
    'connect',
    'joinServer',
    'disconnect',
    'serverError',
    'roomCreated',
    'joinedRoom',
    'leftRoom',
    'userDetailsUpdate',
    'requestUserDetails',
    'syncNetworkEntity',
]);

/**
 * @property requestMatch
 * @property requestJoin
 * @property matchListUpdate
 * @property matchCreated
 * @property joinedMatch
 * @property requestStart
 * @property requestLeave
 */
export const MatchEvent = Enum([
    'requestMatch',
    'requestJoin',
    'matchListUpdate',
    'matchCreated',
    'joinedMatch',
    'requestStart',
    'requestLeave',
    'matchStarted',
]);
