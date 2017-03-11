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

        constructor(user, match, ship) {
            console.log(`create player for ${user.getId()}`);
            this.user = user;
            this.ship = ship;
            this.match = match;
        }

        getMatch() {
            return this.match;
        }

        getShip() {
            return this.ship;
        }

        getUser() {
            return this.user;
        }
    }

    return Player;
}
