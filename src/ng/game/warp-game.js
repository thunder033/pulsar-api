/**
 * Created by gjr8050 on 3/10/2017.
 */

module.exports = {warpGame,
resolve: ADT => [
    ADT.game.Player,
    warpGame]};

function warpGame(Player) {
    /**
     * @type WarpGame
     */
    class WarpGame {
        /**
         * @constructor
         * @param match {ClientMatch}
         */
        constructor(match) {
            this.match = match;
            this.players = match.getUsers().map(user => new Player(user));
        }

        getPlayers() {
            return this.players;
        }
    }

    return WarpGame;
}
