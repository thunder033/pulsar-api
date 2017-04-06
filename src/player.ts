/**
 * Created by Greg on 4/5/2017.
 */
import {INetworkEntity, INetworkEntityCtor, NetworkEntity, NetworkIndex} from './network-index';
import {Match} from './match';
import {IGameComponent, Simulator} from './simulation';
import {ClientComponent} from './client';
import {Composite} from './component';

export class Player extends ClientComponent implements INetworkEntity, IGameComponent {

    private score: number;
    private match: Match;
    private hue: number;

    constructor(parent: Composite) {
        super(parent);
    }

    public onInit(): void {
        const networkIndex = this.server.getComponent(NetworkIndex);
        networkIndex.registerType(this.getType());
        networkIndex.putNetworkEntity(this.getType(), this);
    }

    public attachMatch(match: Match): void {
        this.match = match;
        this.score = 0;

        const simulation = this.server.getComponent(Simulator).getSimulation(match);
        this.hue = simulation.getNewPlayerHue();
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
