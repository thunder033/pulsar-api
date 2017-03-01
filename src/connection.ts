/**
 * Created by gjrwcs on 3/1/2017.
 */

import {UserComponent} from './user';
import {IOEvent} from './event-types';

export class Connection extends UserComponent {

    public onInit() {
        this.socket.on(IOEvent.syncNetworkEntity, this.syncNetworkEntity);
    }

    private syncNetworkEntity(data): void {
        console.log('this doesnt work yet');
    }
}
