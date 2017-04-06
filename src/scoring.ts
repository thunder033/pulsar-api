/**
 * Created by Greg on 4/6/2017.
 */
import {IGameComponent} from './simulation';
import {Match} from './match';
import {Component} from './component';

export class Scoring extends Component implements IGameComponent {

    public attachMatch(match: Match): void {
        // not implemented
    }

    public update(deltaTime: number): void {
        // not implemented
    }

    public getSerializable(): Object {
        return {};
    }
}
