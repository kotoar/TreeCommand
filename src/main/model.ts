import {CommandNodeStore} from "./database/database-accessor";
import {CommandNode} from "../shared/command-node";
import {PrefStore} from "./pref-store/pref-store";
import {StartPosition} from "../shared/prefs";
import {sendUpdateMainList} from "./event-sender";
import {mainWindow} from "./main";

export const nodeMap = new Map<string, CommandNode>();
export const mainModel: MainModel = {
	selectedRootId: 'root',
}
export let preferencesList: PreferencesList = {
	startup: true,
	startPosition: 'leftTop',
}

export function selectedCommandList(): CommandNode[] {
	const selectedNode = nodeMap.get(mainModel.selectedRootId);
	if (!selectedNode) {
		return [];
	}
	const children = selectedNode.children || [];
	return children.map(id => nodeMap.get(id)).filter(node => node !== undefined) as CommandNode[];
}

export function modelInit() {
	const nodes = CommandNodeStore.instance.getAll()
	nodes.forEach(node => {
		nodeMap.set(node.id, node);
	});
	console.log('[Model] Command nodes loaded:', nodes.length);
	const pref = PrefStore.instance.load();
	preferencesList = {...pref};
}

interface MainModel {
	selectedRootId: string;
}

export interface PreferencesList {
	startup: boolean;
	startPosition: StartPosition;
}

export function dismissWindow() {
	mainModel.selectedRootId = 'root';
	sendUpdateMainList(selectedCommandList());
	mainWindow?.hide();
}
