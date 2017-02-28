/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

function playerFactory(User, ClientRoom, ClientMatch){

    class Player extends User {

        constructor(name, socket) {
            super(name, socket);

            this.match = null;
        }

        onJoin(data) {
            super.onJoin(data);

            const room = ClientRoom.getByName(data.name);

            if (room instanceof ClientMatch) {
                this.match = room;
            }
        }

        getMatch(){
            return this.match;
        }
    }

    return Player;
}

module.exports = playerFactory;