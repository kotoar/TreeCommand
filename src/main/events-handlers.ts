import {app, BrowserWindow} from "electron";
import path from "path";
import { spawn } from "child_process";
import {__distname, mainWindow} from "./main";

export type MessageConsumer = {
  channel: string;
  handler: (event: Electron.IpcMainEvent, ...args: any[]) => void;
}

export const eventsRegister: MessageConsumer[] = [
  {
    channel: 'trigger-action',
    handler: (event, action: string, parameters: string[]) => {
      console.log(`[action handler] action: ${action}, parameters: ${parameters}`);
      actionHandler(action, parameters);
    }
  },
  {
    channel: 'open-preferences',
    handler: (event) => {
      openPreferenceWindow();
    }
  },
  {
    channel: 'hide-window',
    handler: (event) => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.hide();
      }
    }
  },
  {
    channel: 'get-focus-window',
    handler: (event) => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        event.returnValue = focusedWindow.getTitle();
      } else {
        event.returnValue = 'None';
      }
    }
  },
  {
    channel: 'resize-main-window',
    handler: (event, width: number, height: number) => {
      mainWindow?.setSize(Math.round(width), Math.round(height), true);
    }
  },
  {
    channel: 'close-app',
    handler: (event) => {
      app.quit();
    }
  }
]

function actionHandler(action: string, parameters: string[]): void {
  if (action === 'open') {
    const filePath = parameters[0];
    if (filePath) {
      spawn('explorer', [filePath], { detached: true });
    }
  }
}

let preferencesWindow: BrowserWindow | null;

function openPreferenceWindow(): void {
  if (preferencesWindow) {
    preferencesWindow.focus();
    return;
  }

  preferencesWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Preferences",
    resizable: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../build/icon-win.ico'),
    webPreferences: {
      preload: path.join(__distname, './preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  preferencesWindow.loadFile(path.join(__distname, './index.html'), {hash: "#/preferences" }).then(() => {});
  preferencesWindow.webContents.openDevTools({ mode: "detach" });

  preferencesWindow.on('closed', () => {
    preferencesWindow = null;
  });
}
