import Store from "electron-store";

export type ActionType = 'open' | 'back' | 'expand'

export interface EncodedNode {
    key: string
    description: string
    actionType: ActionType
    actionParameters: string[]
    children: EncodedNode[]
}

const version: number = 1

export interface Preferences {
    version: number
    tree: string
}

const store = new Store<Preferences>({
    defaults: {
        version: version,
        tree: JSON.stringify([
            {
                key: "a",
                description: "Open Chrome",
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
        ]),
    },
});

export function getEncodedTree(): [string, EncodedNode[]] {
    // @ts-ignore
    if(store.get("version", 1) < version) {
        // migrate
    }
    // @ts-ignore
    const json = store.get("tree", "");
    const object: EncodedNode[] = JSON.parse(json);
    return [JSON.stringify(object, null, 2), object];
}

export function setEncodedTree(newTree: EncodedNode[]) {
    const json = JSON.stringify(newTree);
    // @ts-ignore
    store.set("tree", json);
}

