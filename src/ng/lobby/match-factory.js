'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const Room = require('room');
const MatchEvents = require('event-types').MatchEvent;

function matchFactory(Socket, roomFactory) {

    let createMatch = false;
    const matches = {};

    class Match extends Room {

        constructor(name) {
            if(!createMatch) {
                throw new Error('Matches can only be instantiated through server events');
            }

            this.stale = false;
            createMatch = false;
            super(name);
        }

        isStale() {
            return this.stale;
        }

        markStale() {
            this.stale = true;
        }

        static getMatchSet() {
            return matches;
        }
    }

    function parseNetworkEntity(data) {
        let match = matches[data.name];

        if(!(match instanceof Match)) {
            createMatch = true;
            match = new Match(data.name);
            matches[match.getName()] = match;
        }

        data.stale = false;
        Object.assign(match, data);
        return match;
    }

    function updateMatchList(data) {
        // Mark our collection of matches stale so we know which to delete
        // We don't want to replace the entire collection because we need to preserve references
        Object.keys(matches).forEach(name => matches[name].markStale());

        // Parse each data itme
        data.forEach(parseNetworkEntity);

        // Remove any matches not present on the match list
        Object.keys(matches).forEach(name => {
            if(matches[name].isStale()){
                delete matches[name];
            }
        });
    }

    Socket.on(MatchEvents.matchCreated, parseNetworkEntity);
    Socket.on(MatchEvents.matchListUpdate, updateMatchList);

    return Match;
}

module.exports = matchFactory;