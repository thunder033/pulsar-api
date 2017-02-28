/**
 * Created by Greg on 2/27/2017.
 */

import {Enum} from './enum';

/**
 * @property connection
 * @property serverError
 * @property join
 * @property disconnect
 * @property joinedRoom
 * @property leftRoom
 */
export const IOEvent = Enum([
    'connection',
    'join',
    'disconnect',
    'serverError',
    'joinedRoom',
    'leftRoom',
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
