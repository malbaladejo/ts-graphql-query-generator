import { GraphQlNode } from '../../app/src/graphql-node';

class Main {

    public id = 0;
    public name = '';
    public isActive = true;

    public item = new Item();
    public items = new Array<Item>();
}

class Item {
    public test = '';
    public num = 0;
}

class SubItem extends Item {
    public name = '';
}

function test1() {
    const node = new GraphQlNode<Main>();

    node.scalar(p => p.id, p => p.name)
        .object<Item>(p => p.item, (node) => node.scalar(p => p.num))
        .list<Item>(p => p.items, node =>
            node.scalar(p => p.num, p => p.test)
                .inherited(new SubItem(), (nodei) =>
                    nodei.scalar(pi => pi.name)));

    console.log(node.serialize());
}

test1();