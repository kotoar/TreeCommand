import {contextBridge, ipcRenderer, IpcRendererEvent} from 'electron';
import {CommandNode} from "../shared/command-node";

contextBridge.exposeInMainWorld('electronAPI', {
    triggerAction: (action: string, parameters: string[]) => ipcRenderer.send('trigger-action', action, parameters),
    openPreferences: () => ipcRenderer.send('open-preferences'),
    hideWindow: () => ipcRenderer.send('hide-window'),
    quitApp: () => ipcRenderer.send('close-app'),
    getFocusWindow: (): string => ipcRenderer.sendSync('get-focus-window'),
    resizeMainWindow: (width: number, height: number) => ipcRenderer.send('resize-main-window', width, height)
});

contextBridge.exposeInMainWorld('commandAPI', {
    select: (id: string): void =>
      ipcRenderer.invoke('commands.select', id),
    children: (id: string): CommandNode[] =>
      ipcRenderer.invoke('commands.children', id),
    create: (data: Omit<CommandNode, 'id'>, parentId: string): string =>
      ipcRenderer.invoke('commands.create', data, parentId),
    delete: (id: string, parentId: string): void =>
      ipcRenderer.invoke('commands.delete', id, parentId),
    update: (node: CommandNode, parentId: string): void =>
      ipcRenderer.invoke('commands.update', node),

    updateCommandList: (callback: (event: IpcRendererEvent, list: CommandNode[]) => void) => {
        ipcRenderer.on('command-list-update', callback);
    }
});

contextBridge.exposeInMainWorld('preferencesAPI', {
    getStartup: (): boolean => ipcRenderer.sendSync('preferences.get-startup'),
    setStartup: (enabled: boolean): void => ipcRenderer.send('preferences.set-startup', enabled),
});
