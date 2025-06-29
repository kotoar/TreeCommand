import {proxy} from "valtio/vanilla";
import {CommandNode} from "../../shared/command-node";

export interface PreferencesViewModel {
	startup: boolean;
	tab: 'preferences' | 'commands';
	getChildren(id: string): Promise<CommandNode[]>;
}

export const preferencesViewModel = proxy<PreferencesViewModel>({
	get startup() {
		return window.preferencesAPI.getStartup();
	},
	set startup(value: boolean) {
		window.preferencesAPI.setStartup(value);
	},
	tab: 'preferences',
	getChildren(id: string): Promise<CommandNode[]> {
		return window.commandAPI.children(id);
	}
});
