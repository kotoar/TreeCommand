import {CommandNode} from "./CommandNode";
import {ActionType} from "../main/Store";
import { CommandTree } from "./CommandTree";

export class OpenAppNode extends CommandNode {
    constructor(key: string, description: string, appPath: string) {
        super(key, description);
        this.appPath = appPath;
    }

    appPath: string;

    override type: ActionType = 'open'
    override perform(): void {
        window.electronAPI.openApp(this.appPath);
        window.electronAPI.hideWindow();
    }
}

export class BackNode extends CommandNode {
    override type: ActionType = 'back'
    override perform(): void {
        const tree = CommandTree.tree()
        if(tree.pointer != null && tree.pointer instanceof ExpandNode) {
            tree.pointer = tree.pointer.parent
        } else {
            tree.pointer = undefined
        }
        const channel = new BroadcastChannel('list-sync');
        channel.postMessage(CommandTree.tree().presentList());
    }
}

export class ExpandNode extends CommandNode {
    constructor(key: string,
                description: string,
                parent: CommandNode | undefined = undefined,
                children: CommandNode[] = []) {
        super(key, description);
        this.parent = parent;
        this.children = children;
    }

    parent: CommandNode | undefined
    children: CommandNode[] = []

    override type: ActionType = 'expand'
    override perform(): void {
        const tree = CommandTree.tree()
        tree.pointer = this
        const channel = new BroadcastChannel('list-sync');
        channel.postMessage(CommandTree.tree().presentList());
    }
}
