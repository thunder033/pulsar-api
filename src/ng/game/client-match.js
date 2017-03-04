'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const MatchEvents = require('event-types').MatchEvent;

function matchFactory(Connection, ClientRoom, User, NetworkEntity) {

    const matches = new Map();
    const matchList = [];

    class ClientMatch extends ClientRoom {

        constructor(params) {
            super(params);
        }

        sync(data) {
            super.sync(data);
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

        static getMatchSet() {
            return matchList;
        }
    }

    ClientMatch.MIN_START_USERS = 2;
    ClientMatch.MAX_MATCH_SIZE = 2;

    function creatArray(it) {

    }

    function addMatch(matchId) {
        if(!matchId){
            return;
        }

        NetworkEntity.getById(ClientRoom, matchId).then(match => {
            matches.set(matchId, match);
            matchList.length = 0;

            const it = matches.values();
            let item = it.next();
            while (item.done === false) {
                matchList.push(item.value);
                item = it.next();
            }
        });
    }

    function updateMatchList(data) {
        matches.clear();
        data.forEach(addMatch);
    }

    NetworkEntity.registerType(ClientMatch);
    Connection.ready().then(socket => {
        socket.get().on(MatchEvents.matchCreated, (data) => addMatch(data.matchId));
        socket.get().on(MatchEvents.matchListUpdate, updateMatchList);
    });


    return ClientMatch;
}

module.exports = matchFactory;