import {proxy} from "valtio/vanilla";
import {CommandNode} from "../../shared/command-node";
import {StartPosition} from "../../shared/prefs";

export interface PreferencesViewModel {
	startup: boolean;
	position: StartPosition;
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
	get position() {
		return window.preferencesAPI.getPosition();
	},
	set position(value: StartPosition) {
		window.preferencesAPI.setPosition(value);
	},
	tab: 'preferences',
	getChildren(id: string): Promise<CommandNode[]> {
		return window.commandAPI.children(id);
	}
});

export const startPositionOptions: StartPositionOption[] = [
	{value: 'leftTop', description: 'Left Top'},
	{value: 'center', description: 'Center'},
	{value: 'bottom', description: 'Bottom'},
]

export type StartPositionOption = {value: StartPosition, description: string};
