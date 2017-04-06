/**
 * Created by gjrwcs on 3/8/2017.
 */

import {ServerComponent, SyncServer} from './sync-server';
import {Client, ClientComponent} from './client';
import {PriorityQueue} from './priority-queue';
import Timer = NodeJS.Timer;
import {Match} from './match';
import {Clock} from './clock';
import {IComponent} from './component';
import {WarpField} from './warp-field';
import {WarpDrive} from './warp-drive';
import {state, StateMachine} from './state-machine';
import {bind} from 'bind-decorator';
import {CompositeNetworkEntity} from './composite-network-entity';
import {Networkable} from './network-index';

export interface IGameComponentCtor {
    new(...args: any[]): IGameComponent;
}

export interface IGameComponent extends IComponent {
    attachMatch(match: Match): void;
    update(deltaTime: number): void;
    getSerializable(): Object;
}

type SimulationOperation = (dt: number) => void;

export class Simulator extends ServerComponent {

    private games: Map<string, Simulation>;

    constructor(syncServer: SyncServer) {
        super(syncServer);
        this.games = new Map();
    }

    public createSimulation(match: Match, gameComponents: IGameComponentCtor[]): Simulation {
        const game = new Simulation(match);
        this.games.set(match.getId(), game);

        gameComponents.forEach((type) => {
            if (type.prototype instanceof ClientComponent) {
                match.getUsers().forEach((user) => {
                    user.getComponent(type).attachMatch(match);
                });
            } else if (type.prototype instanceof ServerComponent) {
                this.server.getComponent(type).attachMatch(match);
            } else {
                game.addComponent(type);
                game.getComponent(type).attachMatch(match);
            }
        });

        return game;
    }

    public getSimulation(match: Match): Simulation {
        return this.games.get(match.getId());
    }

    public endSimulation(match: Match): void {
        this.games.get(match.getId()).end();
        this.games.delete(match.getId());
    }
}

export class GameState extends StateMachine {
    @state public Playing;
    @state public Paused;
    @state public LevelComplete;
    @state public Loading;
}

function instanceOfGameComponent(obj: any): obj is IGameComponent {
    return 'attachMatch' in obj &&
        'getSerializable' in obj &&
        'update' in obj;
}

export class Simulation extends CompositeNetworkEntity {

    private warpDrive: WarpDrive;
    private state: GameState;

    private targetFPS: number;
    private operations: PriorityQueue;

    private stepInterval: Timer;
    private lastStepTime: number;
    private match: Match;
    private clock: Clock;

    private readonly SYNC_INTERVAL: number = 50;
    private syncElapsed: number = 0;

    private usedHues: number[] = [];

    constructor(match: Match) {
        super();

        this.operations = new PriorityQueue();
        this.match = match;
        this.clock = new Clock();

        this.state = new GameState();
        this.state.setState(this.state.Loading);

        this.warpDrive = new WarpDrive();
        this.warpDrive.load(new WarpField(), this.state);

        this.schedule(this.warpDrive.update);
        this.schedule(this.syncClients);
        this.getComponent(Networkable).init();
    }

    /**
     * Get the current game time in ms
     * @returns {number}
     */
    public getTime(): number {
        return this.clock.now();
    }

    public getSerializable() {
        const buffer = super.getSerializable();
        this.getComponents().forEach((component: Object | IComponent) => {
            if (instanceOfGameComponent(component)) {
                Object.assign(buffer, component.getSerializable());
            }
        });

        return Object.assign(buffer, {
            matchId: this.match.getId(),
            warpDriveId: this.warpDrive.getId(),
            warpFieldId: this.warpDrive.getWarpField().getId(),
        });
    }

    /**
     * Add an operation to run each step of the simulation
     * @param operation {SimulationOperation}
     * @param [priority] {number}
     */
    public schedule(operation: SimulationOperation, priority?: number) {
        this.operations.enqueue(priority || 0, operation);
    }

    public getState(): GameState {
        return this.state;
    }

    /**
     * Begin running the game
     */
    public start() {
        this.lastStepTime = Date.now();
        this.stepInterval = setInterval(() => this.step(), 1000 / this.targetFPS);
        this.state.setState(this.state.Playing);
    }

    public suspend() {
        this.state.setState(this.state.Paused);
    }

    /**
     * End the simulation
     */
    public end() {
        clearInterval(this.stepInterval);
    }

    /**
     * Generate a unique hue (HSL) value for a player in this game
     * @returns {number} the hue value for an hsl color, 0 - 255
     */
    public getNewPlayerHue(): number {
        let hue = 0;
        let count = 0;
        do {
            hue = ~~(Math.random() * 255);
            if (count++ > 255) {
                throw new Error('No new player hues available within constraints');
            }
        } while (this.isUsedHue(hue));

        this.usedHues.push(hue);
        return hue;
    }

    /**
     * Execute the next step in the simulation
     */
    protected step(): void {
        if (this.state.is(this.state.Paused)) {
            return;
        }

        const stepTime = Date.now();
        const dt = stepTime - this.lastStepTime;
        this.lastStepTime = stepTime;

        const it = this.operations.getIterator();

        while (!it.isEnd()) {
            (it.next() as SimulationOperation).call(null, dt);
        }
    }

    /**
     * Indicates if the given value is used by a player already (within value constraint)
     * @param hue {number}: HSL hue value, 0 - 255
     * @returns {boolean}
     */
    private isUsedHue(hue: number): boolean {
        const THRESHOLD = 50;
        return this.usedHues.some((usedHue) => {
            return Math.abs(usedHue - hue) < THRESHOLD;
        });
    }

    @bind
    private syncClients(dt: number): void {
        this.syncElapsed += dt;
        if (this.syncElapsed > this.SYNC_INTERVAL) {
            this.warpDrive.sync(null, this.match.getName());
            this.syncElapsed = 0;
        }
    }
}
