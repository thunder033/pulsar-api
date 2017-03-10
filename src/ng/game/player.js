/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';
module.exports = {playerFactory, resolve(ADT){return[
    ADT.network.User,
    ADT.game.
    playerFactory]}};

function playerFactory(User, Ship, ClientMatch) {

    class Player {

        constructor(user) {
            this.user = user;
            this.ship = new Ship();

            super(name, socket);

            this.match = null;
        }

        getMatch(){
            return this.match;
        }
    }

    return Player;
}
