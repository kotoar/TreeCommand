import { app, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron';
import path from "path";
import { fileURLToPath } from "url";
import {eventsRegister} from "./events-handler";
import {commandsRegister} from "./commands-handlers";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const __distname = path.join(__dirname, '../../dist');

let mainWindow: BrowserWindow | null;

app.whenReady().then(() => {
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

    mainWindow.loadFile(path.join(__distname, './index.html')).then(r => {
        adjustWindowSize()
    });
    // mainWindow.webContents.openDevTools()

    screen.on('display-metrics-changed', () => adjustWindowSize());
    screen.on('display-added', () => adjustWindowSize());
    screen.on('display-removed', () => adjustWindowSize());
    mainWindow.on('resize', () => adjustWindowSize());

    ipcMain.on('get-focus-window', (event) => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            event.returnValue = focusedWindow.getTitle();
        }
        event.returnValue = 'None';
    });

    globalShortcut.register('Control+Shift+Space', () => {
        if (mainWindow?.isVisible()) {
            mainWindow?.hide();
        } else {
            showWindow();
        }
    });

    ipcMain.on('hide-window', () => {
        mainWindow?.hide();
    });
    ipcMain.on('resize-main-window', (event, width: number, height: number) => {
        if (mainWindow) {
            mainWindow.setSize(Math.round(width), Math.round(height), true);
        }
    });

    eventsRegister.forEach(mc => {
        ipcMain.on(mc.channel, (event, ...args) => {
            mc.handler(event, ...args);
        });
    });

    commandsRegister.forEach(mc => {
        ipcMain.handle(mc.channel, async (event, ...args) => {
            return mc.handler(event, ...args);
        });
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

function adjustWindowSize() {
    if (mainWindow) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        const contentSize = mainWindow.getContentSize();
        const newWidth = Math.min(contentSize[0], width);
        const newHeight = Math.min(contentSize[1], height);
        mainWindow.setSize(newWidth, newHeight);
    }
}

function showWindow(): void {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true);
        mainWindow.focus(); // Ensure window gets focus
    }
}
