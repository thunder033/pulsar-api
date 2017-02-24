/**
 * Created by gjr8050 on 2/23/2017.
 */

import * as uuid from 'uuid/v4';
import {INetworkEntity} from './network-entity';
import {MatchMember} from './match-maker';
import {Room} from './room';

/**
 * Specialized Room for staging new play sessions between users
 */
export class Match extends Room implements INetworkEntity {

    private static MAX_MATCH_SIZE: number = 2;

    private label: string;

    private host: MatchMember;

    constructor(user: MatchMember) {
        super(`match-${uuid()}`);
        user.setHost();
        this.host = user;
        this.setCapacity(Match.MAX_MATCH_SIZE);
    }

    public end(): void {
        return undefined;
    }

    public setLabel(label: string): void {
        this.label = label;
    }

    public getLabel(): string {
        return this.label;
    }

    public isOpen(): boolean {
        return this.users.length < this.getCapacity();
    }

    public start(): void {
        return undefined;
    }

    public getSerializable(): Object {
        return {
            label: this.getLabel(),
            name: this.getName(),
        };
    }
}
