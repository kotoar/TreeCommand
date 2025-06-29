import {mainViewModel} from "../viewmodel/mainViewModel";
import {CommandNode} from "../../shared/command-node";
import {IpcRendererEvent} from "electron";

export function addEventListeners() {
	window.commandAPI.updateCommandList((event: IpcRendererEvent, list: CommandNode[]) => {
			console.log('[EventListener] Command list updated:', list);
			mainViewModel.items = list;
		}
	);
}
