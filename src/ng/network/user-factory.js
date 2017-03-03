/**
 * Maintains state of the user's connection to the server
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

function userFactory(NetworkEntity) {

    class User extends NetworkEntity {

        constructor(params) {
            super(params.id);
            this.name = params.name;
        }

        getName() {
            return this.name;
        }
    }

    return User;
}

module.exports = userFactory;