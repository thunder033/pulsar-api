/**
 * Created by gjr8050 on 2/23/2017.
 */

import * as uuid from 'uuid/v4';
import {INetworkEntity} from './network-entity';
import {MatchMember, MatchMaker} from './match-maker';
import {Room} from './room';
import {IUser, User} from "./user";

/**
 * Specialized Room for staging new play sessions between users
 */
export class Match extends Room implements INetworkEntity {

    private static MAX_MATCH_SIZE: number = 2;

    private label: string;
    private matchMaker: MatchMaker;
    private host: MatchMember;

    constructor(user: MatchMember, matchMaker: MatchMaker) {
        super(`match-${uuid()}`);
        this.host = user;
        this.setCapacity(Match.MAX_MATCH_SIZE);
        this.matchMaker = matchMaker;
    }

    public remove(user: IUser): void {
        super.remove(user);

        if (this.users.length === 0) {
            this.end();
            this.destroy();
        } else if ((user as User).getComponent(MatchMember).isHost()) {
            this.host = (this.users[0] as User).getComponent(MatchMember);
        }
    }

    /**
     * Terminate any ongoing functions associated with the match
     * @returns {undefined}
     */
    public end(): void {
        console.log('ended match ', this.name);
    }

    /**
     * Remove this match from the server
     */
    public destroy(): void {
        this.matchMaker.removeMatch(this);
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

    public getHost(): MatchMember {
        return this.host;
    }

    public start(): void {
        console.log('started match', this.name);
    }

    public getSerializable(): Object {
        return {
            capacity: this.getCapacity(),
            host: this.host.getId(),
            label: this.getLabel(),
            name: this.getName(),
        };
    }
}
