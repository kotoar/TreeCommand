export interface ElectronAPI {
    triggerAction: (action: string, payload?: any) => void;
    hideWindow: () => void;
    openPreferences: () => void;
    getFocusWindow: () => string;
    quitApp: () => void;
    resizeMainWindow: (width: number, height: number) => void;
}

export interface CommandAPI {
    getAll: () => Promise<CommandNode[]>;
    create: (data: Omit<CommandNode, 'id'>, parentId?: string) => Promise<string>;
    delete: (id: string, parentId?: string) => Promise<void>;
    update: (node: CommandNode) => Promise<void>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
        commandAPI: CommandAPI;
    }
}
