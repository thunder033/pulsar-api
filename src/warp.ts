/**
 * Created by Greg on 4/5/2017.
 */
import {ServerComponent, SyncServer} from './sync-server';
import {IGameComponent, IGameComponentCtor, Simulator} from './simulation';
import {Match} from './match';
import {Player} from './player';
import {ShipControl} from './ship-control';
import {Client} from './client';
import {Component} from './component';
import {Scoring} from './scoring';
import {IOEvent} from 'event-types';
import {WarpField} from './warp-field';
import {MatchMaker, MatchMember} from './match-maker';

export class WarpFactory extends ServerComponent {

    private readonly gameComponents: IGameComponentCtor[] = [
        Player,
        ShipControl,
        ShipRoster,
        Scoring,
    ];

    constructor(syncServer: SyncServer) {
        super(syncServer, [ShipControl, Player]);
    }

    public createGame(match: Match) {
        const game = this.server.getComponent(Simulator).createSimulation(match, this.gameComponents);
        const usersReady = match.getUsers().map((user) => user.getComponent(MatchMember).waitForLoaded());
        match.start(game.getId());

        match.getHost().waitForWarpField().then((fieldParams) => {
            game.loadWarpField(WarpField.reconstruct(fieldParams));
            return Promise.all(usersReady);
        }).then(() => {
            game.onClientsLoaded();
            game.sync(null, match.getName());
            const remainingStart = game.getStartTime() - Date.now();
            setTimeout(() => game.start(), remainingStart);
        }).catch((e) => {
            match.broadcast(IOEvent.serverError, e);
        });
    }
}

class ShipRoster extends Component implements IGameComponent {
    private match: Match;

    public getSerializable(): Object {
        const makeIdPair = (user: Client) => Buffer.from(user.getId() + user.getComponent(ShipControl).getShip().getId());
        const shipIds = Buffer.concat(this.match.getUsers().map(makeIdPair));

        return {shipIds};
    }

    public attachMatch(match: Match) {
        this.match = match;
    }

    public update(dt: number) {
        // not implemented
    }
}
