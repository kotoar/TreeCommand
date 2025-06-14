import { contextBridge, ipcRenderer } from 'electron';
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
    getAll: (): Promise<CommandNode[]> =>
      ipcRenderer.invoke('commands.get-all'),
    create: (data: Omit<CommandNode, 'id'>, parentId ?: string): Promise<string> =>
      ipcRenderer.invoke('commandTree.create', data, parentId),
    delete: (id: string, parentId ?: string): Promise<void> =>
      ipcRenderer.invoke('commands.delete', id, parentId),
    update: (node: CommandNode): Promise<void> =>
      ipcRenderer.invoke('commands.update', node),
})
