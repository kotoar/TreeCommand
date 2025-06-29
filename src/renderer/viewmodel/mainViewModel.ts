import {proxy} from "valtio/vanilla";
import {CommandNode} from "../../shared/command-node";

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
