import { app, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron';
import path from "path";
import { fileURLToPath } from "url";
import {eventsRegister} from "./events-handlers";
import {dismissWindow, modelInit, preferencesList, selectedCommandList} from "./model";
import {commandsRegister, preferencesRegister} from './commands-handlers';
import {sendUpdateMainList} from "./event-sender";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const __distname = path.join(__dirname, '../../dist');

export let mainWindow: BrowserWindow | null;

app.whenReady().then(() => {
    modelInit();
    mainWindow = new BrowserWindow({
        width: 400, // Initial width
        height: 400, // Initial height
        x: 50,
        y: 50,
        title: "Main",
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        resizable: true, // ✅ Allow resizing
        autoHideMenuBar: true,
        show: false, // ✅ Start hidden
        icon: path.join(__dirname, '../../build/icon-win.ico'),
        webPreferences: {
            preload: path.join(__distname, './preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__distname, './index.html')).then(() => {
        adjustWindowSize();
        sendUpdateMainList(selectedCommandList());
    });
    mainWindow.webContents.openDevTools({ mode: "detach" });

    screen.on('display-metrics-changed', () => adjustWindowSize());
    screen.on('display-added', () => adjustWindowSize());
    screen.on('display-removed', () => adjustWindowSize());
    mainWindow.on('resize', () => adjustWindowSize());
    mainWindow.on('blur', () => {
        if (mainWindow?.isVisible()) {
            dismissWindow();
        }
    });
    app.setLoginItemSettings({
        openAtLogin: preferencesList.startup,
        openAsHidden: true, // Start hidden
    })

    globalShortcut.register('Control+Shift+Space', () => {
        if (mainWindow?.isVisible()) {
            dismissWindow();
        } else {
            showWindow();
            adjustWindowSize();
        }
    });

    eventsRegister.forEach(mc => {
        ipcMain.on(mc.channel, mc.handler);
    });

    commandsRegister.forEach(mc => {
        ipcMain.handle(mc.channel, mc.handler);
    });

    preferencesRegister.forEach(mc => {
        ipcMain.on(mc.channel, mc.handler);
    })
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

export function adjustWindowSize() {
    if (mainWindow) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const contentSize = mainWindow.getContentSize();
        const winWidth = Math.min(contentSize[0], width);
        const winHeight = Math.min(contentSize[1], height);
        mainWindow.setSize(winWidth, winHeight);
        switch (preferencesList.startPosition) {
            case 'leftTop':
                mainWindow.setPosition(50, 50);
                break;
            case 'center':
                mainWindow.setPosition(width / 2 - winWidth / 2, height / 2 - winHeight / 2);
                break;
            case 'bottom':
                mainWindow.setPosition(width / 2 - winWidth / 2, height - winHeight - 50);
                break;
            default:
                mainWindow.setPosition(50, 50); // Fallback position
        }
    }
}

function showWindow(): void {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true);
        mainWindow.focus(); // Ensure window gets focus
    }
}
