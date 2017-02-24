/**
 * Created by gjr8050 on 2/23/2017.
 */
import {Match} from './match';
import {ServerComponent} from './sync-server';
import {User, UserComponent} from './user';
import {Room} from './room';

/**
 * Providers users the ability to join and leave matches
 */
export class MatchMember extends UserComponent {

    private isHost: boolean;
    private match: Match;

    public onInit() {
        console.log('init match member');
        this.isHost = false;

        // Register event handlers
        this.socket.on('requestMatch', (data) => this.requestMatch(data));
        this.socket.on('requestJoin', (data) => this.requestJoin(data));
    }

    public onDisconnect() {
        this.match.end();
    }

    /**
     * Attempt to create a new match with the given parameters
     * @param data
     */
    public requestMatch(data) {
        console.log('new match requested');
        const match = this.server.getComponent(MatchMaker).createMatch({label: data.label, host: this});

        if (match instanceof Match) {
            this.server.broadcast('matchCreated', match.getSerializable());
        } else {
            this.socket.emit('error', {message: 'A new match could not be created because the server has reached it\'s capacity'});
        }
    }

    /**
     * Marks this user as the host of the current match
     */
    public setHost(): void {
        if (this.match instanceof Match) {
            this.isHost = true;
        }
    }

    /**
     * Attempts to join the match specified by name
     * @param data
     */
    public requestJoin(data) {
        try {
            const match: Match = this.server.getComponent(MatchMaker).joinMatch(this.user, data.name);
            this.server.broadcast('joinedMatch', {user: this.user.getName(), match: match.getName()});
        } catch (e) {
            this.socket.emit('error', e);
        }
    }
}

/**
 * Coordinates the creation and destruction of matches and allowing users to join them
 */
export class MatchMaker extends ServerComponent {

    private static MAX_MATCHES: number = parseInt(process.env.WARP_MAX_MATCHES, 10) || 5;

    private lobby: Room;
    private matches: Match[];

    constructor() {
        super([MatchMember]);
        this.matches = [];
    }

    public onInit(): void {
        this.lobby = this.server.createRoom('lobby');
    }

    /**
     * Creates a new match on the server unless the match limit has been reached
     * @param params: {host, name}: parameters to create the match with
     * @returns {any}
     */
    public createMatch(params): Match {
        if (this.matches.length < MatchMaker.MAX_MATCHES) {
            const match: Match = new Match(params.host);
            this.server.addRoom(match);
            match.setLabel(params.name);
            this.matches.push(match);
            return match;
        } else {
            return null;
        }
    }

    /**
     * Attempts to add the user to the match specified by name
     * @param user {User}: the user to add to the match
     * @param name {string}: the match to find by name
     * @returns {Match}
     */
    public joinMatch(user: User, name: string): Match {
        const match = this.getMatch(name);

        if (!(match instanceof Match)) {
            throw new Error(`Match was not found with name ${name}`);
        }

        if (match.isOpen()) {
            user.join(match);
            match.start();
            return match;
        } else {
            throw new Error(`Cannot join match ${name}. The match is closed.`);
        }
    }

    /**
     * Searches for a match by name and return it if it found, or null if not
     * @param name {string}: the unique name of the match (room)
     * @returns {Match|null}
     */
    private getMatch(name: string): Match {
        let match: Match = null;
        this.matches.some((m: Match) => {
            if (m.getName() === name) {
                match = m;
                return true;
            }
            return false;
        });

        return match;
    }
}
