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
            this.host = null;
            this.started = false;
        }

        sync(data) {
            NetworkEntity.getById(User, data.host).then(user => this.host = user);
            delete data.host;
            super.sync(data);
        }

        isOpen() {
            return this.users.length < this.capacity && this.started === false;
        }

        getHost() {
            return this.host;
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

    function updateMatchList() {
        matchList.length = 0;
        const it = matches.values();
        let item = it.next();
        while (item.done === false) {
            if(item.value.isOpen()) {
                matchList.push(item.value);
            }

            item = it.next();
        }
    }

    function addMatch(matchId) {
        if(!matchId){
            return;
        }

        NetworkEntity.getById(ClientRoom, matchId).then(match => {
            matches.set(matchId, match);
            updateMatchList();
        });
    }

    function parseMatchIds(data) {
        matches.clear();
        data.forEach(addMatch);
        updateMatchList();
    }

    NetworkEntity.registerType(ClientMatch);
    Connection.ready().then(socket => {
        socket.get().on(MatchEvents.matchCreated, (data) => addMatch(data.matchId));
        socket.get().on(MatchEvents.matchListUpdate, parseMatchIds);
    });


    return ClientMatch;
}

module.exports = matchFactory;