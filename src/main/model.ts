import {CommandNodeStore} from "./database/database-accessor";
import {CommandNode} from "../shared/command-node";

export const nodeMap = new Map<string, CommandNode>();
export const mainModel: MainModel = {
	selectedRootId: 'root',
}
export const preferencesList: PreferencesList = {
	startup: true,
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
}

interface MainModel {
	selectedRootId: string;
}

interface PreferencesList {
	startup: boolean;
}
