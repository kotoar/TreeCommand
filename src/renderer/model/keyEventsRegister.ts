import {mainViewModel} from "../viewmodel/mainViewModel";

export type KeyEvent = {
  ctrlKey?: boolean;
  key: string;
  enabled: () => boolean;
  handlers: () => void;
}

export const keyEventsRegister: KeyEvent[] = [
  {
    key: 'Escape',
    enabled: () => window.electronAPI.getFocusWindow() === "Main",
    handlers: () => {
      console.log("Event: Open preferences");
      window.commandAPI.select('root').then(() => {
        window.electronAPI.hideWindow();
        mainViewModel.stack = ['root'];
      });
    }
  },
  {
    ctrlKey: true,
    key: ',',
    enabled: () => window.electronAPI.getFocusWindow() === "Main",
    handlers: () => {
      console.log("Event: Open preferences");
      window.electronAPI.openPreferences()
    }
  }
]