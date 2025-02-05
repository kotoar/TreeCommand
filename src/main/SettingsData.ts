import {CommandNode} from "../renderer/CommandNode";

export class Settings {
    static instance = new Settings();

    focusedNode: CommandNode | undefined;
}