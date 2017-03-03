/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

const IOEvent = require('event-types').IOEvent;

function userFactory(NetworkEntity, Connection) {

    class User extends NetworkEntity {

        constructor(params) {
            super(params.id);
            this.name = params.name;
        }

        getName() {
            return this.name;
        }
    }

    NetworkEntity.registerType(User);
    Connection.addEventListener(IOEvent.join, (e) => {
        // Assign a local user entity to the client connection on join
        Connection.deferReady(NetworkEntity.getById(User, e.userId).then((user) => {
            Connection.user = user;
        }));
    });

    return User;
}

module.exports = userFactory;