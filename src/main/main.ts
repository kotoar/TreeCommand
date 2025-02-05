import { app, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron';
import path from "path";
import { spawn } from "child_process";

import { fileURLToPath } from "url";
import { getEncodedTree } from "./Store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __distname = path.join(__dirname, '../../dist');

let mainWindow: BrowserWindow | null;
let settingsWindow: BrowserWindow | null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400, // Initial width
        height: 600, // Initial height
        x: 50,
        y: 50,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        resizable: true, // ✅ Allow resizing
        autoHideMenuBar: true,
        show: false, // ✅ Start hidden
        webPreferences: {
            preload: path.join(__distname, './preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__distname, './index.html'));
    // mainWindow.webContents.openDevTools()

    screen.on('display-metrics-changed', () => adjustWindowSize());
    screen.on('display-added', () => adjustWindowSize());
    screen.on('display-removed', () => adjustWindowSize());
    mainWindow.on('resize', () => adjustWindowSize());

    globalShortcut.register('Control+Shift+Space', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide();
        } else {
            showWindow();
        }
    });

    ipcMain.on('hide-window', () => {
        mainWindow?.hide();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        adjustWindowSize(); // Ensure proper positioning if the window is recreated
    }
});

async function adjustWindowSize() {
    if (mainWindow) {
        const margin = 50
        mainWindow.setBounds({
            x: margin,
            y: margin,
        });
    }

}
function showWindow(): void {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true);
        mainWindow.focus(); // Ensure window gets focus
    }
}

function openSettingsWindow(): void {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 500,
        height: 400,
        title: "Settings",
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__distname, './preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    settingsWindow.loadFile(path.join(__distname, './index.html'), {hash: "#/settings" });
    settingsWindow.webContents.openDevTools()

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

// ✅ Open settings window when requested
ipcMain.on('open-settings', () => {
    openSettingsWindow();
});

ipcMain.on('open-app', (event, appPath) => {
    spawn(appPath, { detached: true, stdio: 'ignore' }).unref();
});

ipcMain.on("load-encoded-tree", (event) => {
    event.returnValue = getEncodedTree(); // ✅ Send tree data to renderer
});
