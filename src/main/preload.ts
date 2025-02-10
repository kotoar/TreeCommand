import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    hideWindow: () => ipcRenderer.send('hide-window'),
    openApp: (appPath: string) => ipcRenderer.send('open-app', appPath),
    // openSettings: () => ipcRenderer.send('open-settings'),
    openPreferences: () => ipcRenderer.send('open-preferences'),
    loadEncodedTree: () => ipcRenderer.sendSync("load-encoded-tree"),
    updateEncodedTree: (rawValue: string) => ipcRenderer.sendSync("update-encoded-tree", rawValue),
    getFocusWindow: () => ipcRenderer.sendSync('get-focus-window'),
    quitApp: () => ipcRenderer.send('close-app'),
});
