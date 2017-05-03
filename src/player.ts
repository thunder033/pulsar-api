/**
 * Created by Greg on 4/5/2017.
 */
import {INetworkEntity, INetworkEntityCtor, NetworkEntity, NetworkIndex} from './network-index';
import {Match} from './match';
import {IGameComponent, Simulation, Simulator} from './simulation';
import {ClientComponent} from './client';
import {Composite} from './component';
import {GameEvent} from 'pulsar-lib/dist/src/event-types';

export class Player extends ClientComponent implements INetworkEntity, IGameComponent {

    private score: number;
    private multiplier: number;

    private match: Match;
    private hue: number;

    private simulation: Simulation;

    constructor(parent: Composite) {
        super(parent);
        this.score = 0;
        this.match = null;
        this.multiplier = 1;
    }

    public incrementScore() {
        this.score += this.multiplier;
    }

    public addMultiplier(amount: number) {
        this.multiplier += amount || 0;
    }

    public resetMultiplier() {
        this.multiplier = Math.min(1, this.multiplier);
    }

    public setMultiplier(multiplier: number) {
        this.multiplier = multiplier;
    }

    public onInit(): void {
        const networkIndex = this.server.getComponent(NetworkIndex);
        networkIndex.registerType(this.getType());
        networkIndex.putNetworkEntity(this.getType(), this);

        this.socket.on(GameEvent.pause, () => {
            this.simulation.suspend(this.getId());
        });

        this.socket.on(GameEvent.resume, () => {
            this.simulation.resume(this.getId());
        });
    }

    public onDisconnect(): void {
        if (this.match !== null) {
            this.match.end();
        }
    }

    public attachMatch(match: Match): void {
        this.match = match;
        this.score = 0;

        this.simulation = this.server.getComponent(Simulator).getSimulation(match);
        this.hue = this.simulation.getNewPlayerHue();
    }

    public update(dt: number) {
        // not implemented
    }

    public getSerializable(): Object {
        return {
            hue: this.hue,
            id: this.getId(),
            score: this.score,
        };
    }

    public getId(): string {
        return this.user.getId();
    }

    public sync(socket?: SocketIO.Socket): void {
        NetworkEntity.prototype.sync.apply(this, socket);
    }

    public getType(): INetworkEntityCtor {
        return this.constructor as INetworkEntityCtor;
    }
}
