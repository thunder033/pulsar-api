/**
 * Created by Greg on 4/5/2017.
 */
import {ClientComponent} from './client';
import {IGameComponent, Simulation, Simulator} from './simulation';
import {Ship} from './ship';
import {PriorityQueue} from 'priority-queue';
import {Connection} from './connection';
import {Match} from './match';
import {GameEvent} from 'pulsar-lib/dist/src/event-types';
import {bind} from 'bind-decorator';
import {Command, StrafeCommand} from './commands';

export class ShipControl extends ClientComponent implements IGameComponent {
    private ship: Ship;
    private commandQueue: PriorityQueue;
    private connection: Connection;
    private match: Match;
    private simulation: Simulation;

    private readonly SYNC_INTERVAL: number = 50;
    private syncElapsed: number = 0;

    public onInit() {
        this.connection = this.user.getComponent(Connection);
        this.commandQueue = new PriorityQueue();
    }

    public attachMatch(match: Match): void {
        this.match = match;
        this.socket.on(GameEvent.command, (data) => this.queueCommand(data));
        const simulation = this.server.getComponent(Simulator).getSimulation(this.match);
        simulation.schedule(this.update);

        this.ship = new Ship();
        simulation.schedule(this.ship.update);
        simulation.schedule(this.syncClients, 10);
        this.simulation = simulation;

        this.syncElapsed = 0;
    }

    public getShip(): Ship {
        return this.ship;
    }

    public getSerializable(): Object {
        return {};
    }

    @bind
    public update(dt: number): void {
        while (this.commandQueue.peek() !== null) {
            (this.commandQueue.dequeue() as Command).execute(dt);
        }
    }

    @bind
    private syncClients(dt: number): void {
        this.syncElapsed += dt;
        if (this.syncElapsed > this.SYNC_INTERVAL) {
            this.ship.sync(null, this.match.getName());
            this.syncElapsed = 0;
        }
    }

    private queueCommand(data) {
        // calculate the timestamp
        const timestamp: number = Date.now() - (this.connection.getPing() || 0);
        const cmd = new StrafeCommand({direction: parseInt(data, 10), ship: this.ship, timestamp});
        this.commandQueue.enqueue(timestamp, cmd);
    }
}
