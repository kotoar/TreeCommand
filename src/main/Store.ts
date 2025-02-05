import Store from "electron-store";

export type ActionType = 'open' | 'back' | 'expand'

export interface EncodedNode {
    key: string
    description: string
    actionType: ActionType
    actionParameters: string[]
    children: EncodedNode[]
}

export interface Preferences {
    commandTree: EncodedNode[]
}

const store = new Store<Preferences>({
    defaults: {
        commandTree: [
            {
                key: "a",
                description: "Open Chrome 1",
                actionType: "open",
                actionParameters: ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"],
                children: [],
            },
            {
                key: "e",
                description: "Expand",
                actionType: "expand",
                actionParameters: [],
                children: [
                    {
                        key: "b",
                        description: "Back Root",
                        actionType: "back",
                        actionParameters: [],
                        children: [],
                    },
                ],
            },
        ],
    },
});

export function getEncodedTree(): EncodedNode[] {
    // @ts-ignore
    return store.get("commandTree", []);
}

export function setCommandTree(newTree: EncodedNode[]) {
    // @ts-ignore
    store.set("commandTree", newTree);
}

