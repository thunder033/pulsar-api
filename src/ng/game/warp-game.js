/**
 * Created by gjr8050 on 3/10/2017.
 */

module.exports = {warpGameFactory,
resolve: ADT => [
    ADT.game.Player,
    ADT.network.NetworkEntity,
    ADT.game.ClientMatch,
    ADT.game.ClientShip,
    ADT.network.User,
    ADT.ng.$q,
    warpGameFactory]};

function warpGameFactory(Player, NetworkEntity, ClientMatch, ClientShip, User, $q) {
    const utf8Decoder = new TextDecoder('utf-8');
    function createPlayers(buffer, match) {
        const players = [];

        const view = new DataView(buffer);
        const bufferString = utf8Decoder.decode(view);

        for(let i = 0; i * NetworkEntity.ID_LENGTH < bufferString.length; i += 2) {
            const userId = bufferString.substr(i * NetworkEntity.ID_LENGTH, NetworkEntity.ID_LENGTH);
            const shipId = bufferString.substr((i + 1) * NetworkEntity.ID_LENGTH, NetworkEntity.ID_LENGTH);
            console.log(`create player for ship ${shipId} and user ${userId}`);
            players.push($q.all([
                NetworkEntity.getById(User, userId),
                NetworkEntity.getById(ClientShip, shipId),
            ]).spread((user, ship) => new Player(user, match, ship)));
        }

        return $q.all(players);
    }

    /**
     * @type WarpGame
     */
    class ClientSimulation extends NetworkEntity {
        /**
         * @constructor
         */
        constructor(params) {
            super(params.id);
            this.match = null;
            this.players = [];
        }

        sync(params) {
            return NetworkEntity.getById(ClientMatch, params.matchId).then(match => {
                this.match = match;
                return createPlayers(params.shipIds, match).then(players => this.players = players);
            }).finally(() => {
                delete params.matchId;
                delete params.shipIds;
                super.sync(params);
            });
        }

        getPlayers() {
            return this.players;
        }

        getMatch() {
            return this.match;
        }
    }

    NetworkEntity.registerType(ClientSimulation);

    return ClientSimulation;
}
