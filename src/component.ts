/**
 * Created by gjr8050 on 2/23/2017.
 */

export abstract class Composite {
    private components: Map<string, Component>;

    constructor(componentTypes: IComponent[] = []) {
        this.components = new Map<string, Component>();
        componentTypes.forEach((type: IComponent) => this.addComponent(type));
    }

    public getComponent<T extends Component>(type: {new(parent: Composite): T}): T {
        return this.components.get(type.name) as T;
    }

    public addComponent(componentType: IComponent): Component {
        const component = new componentType(this);
        this.components.set(componentType.name, component);
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
     * @param data: arbitrary data to pass to the event handler
     */
    protected invokeComponentEvents(memberMethod: string, data?: any): void {
        const it = this.components.values();

        let item = it.next();
        while (item.done === false) {
            if (typeof item.value[memberMethod] === 'function') {
                item.value[memberMethod](data);
            }

            item = it.next();
        }
    }
}

export interface IComponent {
    new(parent: Composite): Component;
}

export abstract class Component {
    protected parent: Composite;

    constructor(parent: Composite) {
        this.parent = parent;
    }
}
