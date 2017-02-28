/**
 * Created by Greg on 2/27/2017.
 */

import {Enum} from './enum';

/**
 * @property connect
 * @property serverError
 * @property join
 * @property disconnect
 * @property roomCreated
 * @property joinedRoom
 * @property leftRoom
 * @property userDetailsUpdate
 */
export const IOEvent = Enum([
    'connect',
    'join',
    'disconnect',
    'serverError',
    'roomCreated',
    'joinedRoom',
    'leftRoom',
    'userDetailsUpdate',
]);

/**
 * @property requestMatch
 * @property requestJoin
 * @property matchListUpdate
 * @property matchCreated
 * @property joinedMatch
 */
export const MatchEvent = Enum([
    'requestMatch',
    'requestJoin',
    'matchListUpdate',
    'matchCreated',
    'joinedMatch',
]);
