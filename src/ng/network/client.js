'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */

const IOEvent = require('event-types').IOEvent;
const MatchEvent = require('event-types').MatchEvent;

module.exports = {clientFactory,
resolve: ADT => [
    ADT.network.Connection,
    ADT.ng.$rootScope,
    ADT.network.AsyncInitializer,
    clientFactory]};

function clientFactory(Connection, $rootScope, AsyncInitializer) {

    class Client extends AsyncInitializer {

        constructor() {
            super();

            this.user = null;
            const forward = this.forwardClientEvent.bind(this);
            $rootScope.$on(IOEvent.joinedRoom, forward);
            $rootScope.$on(IOEvent.leftRoom, forward);
            $rootScope.$on(MatchEvent.matchStarted, forward);
            $rootScope.$on(MatchEvent.matchEnded, forward);
        }

        getUser() {
            return this.user;
        }

        emit(name, data) {
            Connection.getSocket().get().emit(name, data);
        }

        forwardClientEvent(evt, args) {
            console.log('client recieved evt ', evt.name);
            console.log(args);
            if((args.user && args.user === this.user) || args.clientEvent === true) {
                const e = new Event(evt.name);
                Object.assign(e, args);
                this.dispatchEvent(e);
            }
        }

        authenticate(credentials) {
            return Connection.authenticate(credentials).then((user) => {
                this.user = user;
                this.emit(IOEvent.joinServer);
                return user;
            });
        }
    }

    return new Client();
}
