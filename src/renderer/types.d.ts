import {IpcRendererEvent} from "electron";

export interface ElectronAPI {
    triggerAction: (action: string, payload?: any) => void;
    openPreferences: () => void;
    hideWindow: () => void;
    resizeMainWindow: (width: number, height: number) => void;
    getFocusWindow: () => string;
    quitApp: () => void;
}

export interface CommandAPI {
    select: (id: string) => Promise<void>;
    children: (id: string) => Promise<CommandNode[]>;
    create: (data: Omit<CommandNode, 'id'>, parentId: string) => Promise<string>;
    delete: (id: string, parentId: string) => Promise<void>;
    update: (node: CommandNode, parentId: string) => Promise<void>;

    updateCommandList: (callback: (event: IpcRendererEvent, list: CommandNode[]) => void) => void;
}

export interface PreferencesAPI {
    getStartup: () => boolean;
    setStartup: (enabled: boolean) => void;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
        commandAPI: CommandAPI;
        preferencesAPI: PreferencesAPI;
    }
}
