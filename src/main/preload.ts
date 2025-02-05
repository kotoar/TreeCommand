import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    hideWindow: () => ipcRenderer.send('hide-window'),
    openApp: (appPath: string) => ipcRenderer.send('open-app', appPath),
    openSettings: () => ipcRenderer.send('open-settings'),
    loadEncodedTree: () => ipcRenderer.sendSync("load-encoded-tree")
});


