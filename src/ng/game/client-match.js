'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const MatchEvents = require('event-types').MatchEvent;

function matchFactory(Socket, ClientRoom, User) {

    let createMatch = false;
    const matches = {};

    class ClientMatch extends ClientRoom {

        constructor(name) {
            if(!createMatch) {
                throw new Error('Matches can only be instantiated through server events');
            }

            super(name);
            this.stale = false;

            createMatch = false;
        }

        getUsers() {
            return this.users;
        }

        canStart() {
            return this.users.filter(user => user instanceof User).length >= ClientMatch.MIN_START_USERS;
        }

        getLabel() {
            return this.label;
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

    ClientMatch.MIN_START_USERS = 2;
    ClientMatch.MAX_MATCH_SIZE = 2;

    function parseNetworkEntity(data) {
        let match = matches[data.name];

        if(!(match instanceof ClientMatch)) {
            createMatch = true;
            match = new ClientMatch(data.name);
            matches[match.getName()] = match;
        }

        data.stale = false;
        Object.assign(match, data);
        console.log(`created match`, match);
        return match;
    }

    function updateMatchList(data) {
        // Mark our collection of matches stale so we know which to delete
        // We don't want to replace the entire collection because we need to preserve references
        Object.keys(matches).forEach(name => matches[name].markStale());

        // Parse each data item
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

    return ClientMatch;
}

module.exports = matchFactory;