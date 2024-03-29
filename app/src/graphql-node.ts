
export interface IGraphQlNode {
    serialize(level?: number): string;
}

export class GraphQlNode<T> implements IGraphQlNode {
    private scalars = new Array<string>();

    private objects = new Array<IGraphQlNode>();
    private listObjects = new Array<IGraphQlNode>();

    constructor(public name?: string) {

    }

    public addScalar(...props: Array<(t: T) => void>): GraphQlNode<T> {
        props.forEach(p => this.scalars.push(p.constructor.name));
        // this.scalars = [...this.scalars, ...props];
        return this;
    }

    public addObject<TObject>(prop: (t: T) => TObject, objectNodeFactory: (o: GraphQlNode<TObject>) => GraphQlNode<TObject>): GraphQlNode<T> {
        const objectNode = new GraphQlNode<TObject>(this.getPropertyName(prop));
        this.objects.push(objectNode);
        objectNodeFactory(objectNode);
        return this;
    }

    public addListObject<TObject>(prop: (t: T) => Array<TObject>, objectNodeFactory: (o: GraphQlNode<TObject>) => GraphQlNode<TObject>): GraphQlNode<T> {
        const objectNode = new GraphQlNode<TObject>(this.getPropertyName(prop));
        this.listObjects.push(objectNode);
        objectNodeFactory(objectNode);
        return this;
    }

    public serialize(level?: number): string {
        const currentLevel = level ?? 0;
        return '';
    }

    private getPropertyName(prop: (t: any) => any): string {
        const regex = /\s+return\s[^\.]+\.(?<prop>[^;]+);/gm

        const result = regex.exec(prop.toString());
        if (!result?.groups) {
            throw new Error(`The expression ${prop.toString()} is not correct`);
        }
        return result.groups['prop'];
    }
}

class Test {
    public test() {
        const node = new GraphQlNode<MyClass>();
        node.addScalar(p => p.id, p => p.name)
            .addObject<MySubClass>(p => p.item, (node) => node.addScalar(p => p.num))
            .addListObject<MySubClass>(p => p.items, node => node.addScalar(p => p.num));
    }
}

class MyClass {

    constructor(public id: string, public name: string) {


    }

    public item = new MySubClass();
    public items = new Array<MySubClass>();
}

class MySubClass {
    public test = '';
    public num = 0;
}