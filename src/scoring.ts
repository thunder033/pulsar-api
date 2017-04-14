/**
 * Created by Greg on 4/6/2017.
 */
import {GameState, IGameComponent, Simulation} from './simulation';
import {Match} from './match';
import {Component} from './component';
import {LevelSlice, WarpField} from './warp-field';
import {WarpDrive} from './warp-drive';
import {Player} from './player';
import {Ship} from './ship';
import {ShipControl} from './ship-control';
import {bind} from 'bind-decorator';

class ScoreState {
    public lastCollectedLane: number = 0;
    public multiplerStartSlice: number = 0;
    public lastCollectedSlice: number = 0;
}

enum Gem {
    'NONE',
    'GREEN',
    'COLLECTED',
    'BLACK',
}

export class Scoring extends Component implements IGameComponent {

    private warpField: WarpField;
    private warpDrive: WarpDrive;
    private players: Player[];
    private simulation: Simulation;
    private scoreStates: Map<Player, ScoreState>;
    private ships: Map<Player, Ship>;

    public attachMatch(match: Match): void {
        this.simulation = this.getParent() as Simulation;
        this.warpDrive = this.simulation.getWarpDrive();
        this.warpField = this.warpDrive.getWarpField();

        this.players = match.getUsers().map((client) => client.getComponent(Player));
        this.scoreStates = new Map<Player, ScoreState>();
        this.ships = new Map<Player, Ship>();
        this.players.forEach((player) => {
            this.scoreStates.set(player, new ScoreState());
            this.ships.set(player, player.getParent().getComponent(ShipControl).getShip());
        });
    }

    @bind
    public update(deltaTime: number): void {
        if (this.warpField === null) {
            // poll for the warp field if it isn't set
            this.warpField = this.warpDrive.getWarpField();
            return;
        }

        const COLLECT_OFFSET = 2;
        const sliceIndex = this.warpDrive.getSliceIndex() + COLLECT_OFFSET;

        // Only collect gems from even slices (only even slices are rendered for spacing)
        if (sliceIndex % 2 === 1 || !this.simulation.getState().is(GameState.Playing)) {
            return;
        }

        const sliceGems = this.warpDrive.getSlice(COLLECT_OFFSET).getGems();

        const BASE_MULTIPLIER_DIST = 10;
        const SAME_LANE_MULTIPLIER = 0.05;
        const DIFF_LAME_MULTIPLIER = 0.3;

        this.players.forEach((player) => {
            const currentLane: number = this.ships.get(player).getLaneFromPos();
            const scoreState: ScoreState = this.scoreStates.get(player);
            const collectedLastGem: boolean = sliceIndex - scoreState.lastCollectedSlice === 2;

            sliceGems.forEach((gem, lane) => {
                // Preserve the multiplier the player has when they avoid a black gem
                if (collectedLastGem && gem === Gem.BLACK) {
                    scoreState.lastCollectedSlice = sliceIndex;
                }

                if (lane !== currentLane || gem === Gem.NONE || gem === Gem.COLLECTED) {
                    return;
                }

                if (gem === Gem.GREEN) {
                    player.incrementScore();

                    // If the player collected the last gem and has maintained streak longer
                    // than the minimum length to increase the multiplier from its base value
                    // increment their multiplier
                    const streakLength =  sliceIndex - scoreState.multiplerStartSlice;
                    if (collectedLastGem) {
                        if (streakLength > BASE_MULTIPLIER_DIST) {
                            player.addMultiplier(scoreState.lastCollectedLane !== lane ?
                                DIFF_LAME_MULTIPLIER :
                                SAME_LANE_MULTIPLIER);
                        }
                    } else {
                        scoreState.multiplerStartSlice = sliceIndex;
                        player.resetMultiplier();
                    }

                    // TODO: EMIT COLLECTION EVENT
                    scoreState.lastCollectedLane = lane;
                    scoreState.lastCollectedSlice = sliceIndex;
                } else if (gem === Gem.BLACK) {
                    player.setMultiplier(0);
                    scoreState.multiplerStartSlice = sliceIndex;
                    // TODO: EMIT COLLECTION EVENT
                }

                sliceGems[lane] = Gem.COLLECTED;
                this.warpField.syncSlice(sliceIndex);
                player.sync();
            });
        });

        // TODO: might need to do something about update priority...
    }

    public getSerializable(): Object {
        return {};
    }
}
