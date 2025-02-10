import {EncodedNode} from "./main/Store";
import {FocusedWindow} from "./main/UnifiedPref";

export interface ElectronAPI {
    openApp: (appPath: string) => void;
    hideWindow: () => void;
    // openSettings: () => void;
    openPreferences: () => void;
    loadEncodedTree: () => [string, EncodedNode[]];
    updateEncodedTree: (rawValue: string) => boolean;
    getFocusWindow: () => FocusedWindow | null;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
