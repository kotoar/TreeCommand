import {EncodedNode} from "./main/Store";

export interface ElectronAPI {
    openApp: (appPath: string) => void;
    hideWindow: () => void;
    openSettings: () => void;
    loadEncodedTree: () => EncodedNode[];
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
