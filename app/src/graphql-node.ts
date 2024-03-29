import { IGraphQlNode } from "./igraphql-node";

export class GraphQlNode<T> implements IGraphQlNode {
    public hasInherited = false;
    public className = '';

    private scalars = new Array<string>();
    private objects = new Array<IGraphQlNode>();
    private listObjects = new Array<IGraphQlNode>();

    constructor(public name?: string) {

    }

    public get isInherited(): boolean {
        return !!this.className;
    }

    public scalar(...props: Array<(t: T) => void>): GraphQlNode<T> {
        props.forEach(prop => this.scalars.push(this.getPropertyName(prop)));
        return this;
    }

    public object<TObject>(
        prop: (t: T) => TObject,
        objectNodeFactory: (o: GraphQlNode<TObject>) => GraphQlNode<TObject>): GraphQlNode<T> {
        const objectNode = new GraphQlNode<TObject>(this.getPropertyName(prop));
        this.objects.push(objectNode);
        objectNodeFactory(objectNode);
        return this;
    }

    public inherited<TInherited>(
        item: TInherited,
        objectNodeFactory: (o: GraphQlNode<TInherited>) => GraphQlNode<TInherited>): GraphQlNode<T> {
        const objectNode = new GraphQlNode<TInherited>();

        let className = (item as any).className;
        if (!className) {
            className = (item as any).constructor.name;
        }

        objectNode.className = className;
        this.hasInherited = true;
        this.objects.push(objectNode);
        objectNodeFactory(objectNode);
        return this;
    }

    public list<TObject>(
        prop: (t: T) => Array<TObject>,
        objectNodeFactory: (o: GraphQlNode<TObject>) => GraphQlNode<TObject>): GraphQlNode<T> {
        const objectNode = new GraphQlNode<TObject>(this.getPropertyName(prop));
        this.listObjects.push(objectNode);
        objectNodeFactory(objectNode);
        return this;
    }

    public serialize(level?: number): string {
        let currentLevel = level ?? 0;
        let value = '';

        ({ value, currentLevel } = this.addFieldNameForObjectAndCollection(value, currentLevel));

        value = this.addTypename(value, currentLevel);

        ({ value, currentLevel } = this.addInheritedClassName(value, currentLevel));

        value = this.addScalars(value, currentLevel);

        value = this.serializeCollection(value, currentLevel);

        value = this.serializeObject(value, currentLevel);

        ({ currentLevel, value } = this.addRightBracketForInherited(currentLevel, value));

        value = this.addRightBranketForObjectAndCollection(value, currentLevel);

        return value;
    }

    private addRightBranketForObjectAndCollection(value: string, currentLevel: number) {
        if (this.name) {
            value += `${this.padLeft(currentLevel - 1)}}\n`;

        }
        return value;
    }

    private addRightBracketForInherited(currentLevel: number, value: string) {
        if (this.isInherited) {
            currentLevel--;
            value += `${this.padLeft(currentLevel)}}\n`;
        }
        return { currentLevel, value };
    }

    private serializeObject(value: string, currentLevel: number) {
        for (const node of this.objects) {
            value += node.serialize(currentLevel);
        }
        return value;
    }

    private serializeCollection(value: string, currentLevel: number) {
        for (const node of this.listObjects) {
            value += node.serialize(currentLevel);
        }
        return value;
    }

    private addScalars(value: string, currentLevel: number) {
        for (const prop of this.scalars) {
            value += `${this.padLeft(currentLevel)}${prop}\n`;
        }
        return value;
    }

    private addInheritedClassName(value: string, currentLevel: number) {
        if (this.isInherited) {
            value += `${this.padLeft(currentLevel)}... on ${this.className} {\n`;
            currentLevel++;
        }
        return { value, currentLevel };
    }

    private addTypename(value: string, currentLevel: number) {
        if (this.hasInherited) {
            value += `${this.padLeft(currentLevel)}__typename\n`;
        }
        return value;
    }

    private addFieldNameForObjectAndCollection(value: string, currentLevel: number) {
        if (this.name) {
            value += `${this.padLeft(currentLevel)}${this.name} {\n`;
            currentLevel++;
        }
        return { value, currentLevel };
    }

    private padLeft(length: number): string {
        let value = '';

        for (let i = 0; i < length; i++) {
            value += '   ';
        }
        return value;
    }

    private getPropertyName(prop: (t: any) => any): string {
        const regex = /[^\s]+\s+[^\.]+\.(?<prop>.*)/gm;
        const result = regex.exec(prop.toString());

        if (!result?.groups) {
            throw new Error(`The expression ${prop.toString()} is not correct.`);
        }

        return result.groups['prop'];
    }
}