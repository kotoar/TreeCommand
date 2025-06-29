import {CommandNode} from "../shared/command-node";
import {mainWindow} from "./main";

export function sendUpdateMainList(list: CommandNode[]) {
	mainWindow?.webContents.send('command-list-update', list);
	console.log('[EventSender] Sent command list update to main window: ', list.length);
}
