/**
 * Created by Greg on 4/5/2017.
 */
import {Composite, IComponentCtor} from './component';
import {INetworkEntity, Networkable} from './network-index';

export class CompositeNetworkEntity extends Composite implements INetworkEntity {
    constructor(componentTypes: IComponentCtor[] = []) {
        componentTypes.unshift(Networkable);
        super(componentTypes);
    }

    public getSerializable(): Object {
        return {
            id: this.getId(),
        };
    }

    public getId(): string {
        return this.getComponent(Networkable).getId();
    }

    public getType() {
        return this.getComponent(Networkable).getType();
    }

    public sync(socket?: SocketIO.Socket, roomName?: string): void {
        this.getComponent(Networkable).sync(socket, roomName);
    }
}
