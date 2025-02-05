import {BackNode, ExpandNode, OpenAppNode} from "./CommandAction";
import { CommandNode } from "./CommandNode";

export type ActionType = 'open' | 'back' | 'expand'

interface EncodedNode {
    key: string
    description: string
    actionType: ActionType
    actionParameters: string[]
    children: EncodedNode[]
}

export class CommandTree {
    static instance: CommandTree;
    static tree(overrideTree: CommandTree | undefined = undefined) {
        if (overrideTree) {
            CommandTree.instance = overrideTree;
        }
        if(!CommandTree.instance) {
            CommandTree.instance = new CommandTree();
        }
        return CommandTree.instance;
    }

    rootList: CommandNode[]
    pointer: CommandNode | undefined

    constructor(rootList: CommandNode[] = []) {
        this.rootList = rootList
        this.pointer = undefined
    }

    detectKeyList() {
        return new Map(this.presentList().map(node => [node.key, node]))
    }

    presentList() {
        if(this.pointer === undefined) {
            return this.rootList
        } else if(this.pointer instanceof ExpandNode) {
            return this.pointer.children
        }
        return []
    }

    static listener: Set<()=>void> = new Set()

    static initializeFromPreference(encoded: EncodedNode[]): CommandTree {
        return new CommandTree(encoded.map(n => this.decode(n)))
    }

    private static decode(node: EncodedNode, parent: CommandNode | undefined = undefined): CommandNode {
        switch (node.actionType) {
            case "open":
                return new OpenAppNode(node.key, node.description, node.actionParameters[0]);
            case "back":
                return new BackNode(node.key, node.description);
            case "expand":
                let expandNode = new ExpandNode(node.key, node.description, parent, []);
                expandNode.children = node.children.map((n) => this.decode(n, expandNode));
                return expandNode;
            default:
                throw new Error("Unknown Node Type");
        }
    }

    private static encode(node: CommandNode): EncodedNode {
        if (node instanceof OpenAppNode) {
            return {
                key: node.key,
                description: node.description,
                actionType: "open",
                actionParameters: [node.appPath],
                children: [],
            };
        } else if (node instanceof BackNode) {
            return {
                key: node.key,
                description: node.description,
                actionType: "back",
                actionParameters: [],
                children: [],
            };
        } else if (node instanceof ExpandNode) {
            return {
                key: node.key,
                description: node.description,
                actionType: "expand",
                actionParameters: [],
                children: node.children.map((n) => this.encode(n)),
            };
        } else {
            throw new Error("Unknown Node Type");
        }
    }

}
