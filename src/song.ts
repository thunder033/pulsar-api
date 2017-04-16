import {NetworkEntity} from './network-index';
/**
 * Created by gjrwcs on 4/10/2017.
 */

export class Song extends NetworkEntity {
    private name: string;
    private artist: string;
    private duration: number; // in milliseconds
    private url: string;

    constructor(params: {name: string, artist: string, duration: number, url: string}) {
        super(Song);
        this.name = params.name;
        this.artist = params.artist;
        this.duration = params.duration;
        this.url = params.url;
    }

    public getSerializable() {
        return Object.assign(super.getSerializable(), {
            artist: this.artist,
            duration: this.duration,
            name: this.name,
            url: this.url,
        });
    }
}
