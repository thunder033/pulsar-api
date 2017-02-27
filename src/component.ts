/**
 * Created by gjr8050 on 2/23/2017.
 */

export abstract class Composite {
    private components: Map<string, Component>;

    constructor() {
        this.components = new Map<string, Component>();
    }

    public getComponent<T extends Component>(type: {new(): T}): T {
        return this.components.get(type.name) as T;
    }

    public addComponent(type: IComponent): Component {
        const component = new type();
        this.components.set(type.name, component);
        return component;
    }

    protected getComponents(): Component[] {
        const components = [];
        const it = this.components.values();

        let item = it.next();
        while (item.done === false) {
            components.push(item.value);
            item = it.next();
        }

        return components;
    }

    /**
     * Invoke a method on all components (type-unsafe)
     * @param memberMethod: name of the handler to invoke
     * @param data: arbitray data to pass to the event handler
     */
    protected invokeComponentEvents(memberMethod: string, data?: any): void {
        const it = this.components.values();

        let item = it.next();
        while (item.done === false) {
            if (item.value[memberMethod] === 'function') {
                item.value[memberMethod](data);
            }

            item = it.next();
        }
    }
}

export interface IComponent {
    new(): Component;
}

export abstract class Component {

}
