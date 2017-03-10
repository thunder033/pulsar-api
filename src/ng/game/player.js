/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
module.exports = {playerFactory,
resolve: ADT => [
    ADT.network.User,
    ADT.game.ClientShip,
    ADT.game.ClientMatch,
    playerFactory]};

function playerFactory(User, ClientShip, ClientMatch) {
    class Player {

        constructor(user, match) {
            this.user = user;
            this.ship = new ClientShip();

            this.match = null;
        }

        getMatch() {
            return this.match;
        }

        getShip() {
            return this.ship;
        }
    }

    return Player;
}
