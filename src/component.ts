/**
 * Created by gjr8050 on 2/23/2017.
 */

export abstract class Composite {
    private components: Map<string, Component>;

    constructor() {
        this.components = new Map<string, Component>();
    }

    public getComponent<T extends Component>(type: {new(): T}): T {
        return this.components[type.name];
    }

    public addComponent(type: IComponent): Component {
        const component = new type();
        this.components[type.name] = component;
        return component;
    }

    /**
     * Invoke a method on all components (type-unsafe)
     * @param memberMethod: name of the handler to invoke
     * @param data: arbitray data to pass to the event handler
     */
    protected invokeComponentEvents(memberMethod: string, data?: any) {
        Object.keys(this.components).forEach((type: string) => {
            this.components[type][memberMethod](data);
        });
    }
}

export interface IComponent {
    new(): Component;
}

export abstract class Component {

}
