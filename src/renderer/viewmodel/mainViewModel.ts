import {proxy} from "valtio/vanilla";
import {ActionType, CommandNode} from "../../shared/command-node";

export interface MainViewModel {
  items: CommandNode[];
  stack: string[];
  select(id: string): void;
}

export const mainViewModel = proxy<MainViewModel>({
  items: [],
  stack: ['root'],
  select(id: string) {
    window.commandAPI.select(id).then(() => {});
  }
});

export function presentText(node: {actionType: ActionType, description: string}): string {
  switch (node.actionType) {
    case 'open':
      return node.description;
    case 'back':
      return `Back`;
    case 'expand':
      return node.description;
    default:
      return node.description;
  }
}
