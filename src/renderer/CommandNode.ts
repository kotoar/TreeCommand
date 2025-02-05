import {ActionType} from "../main/Store";

export abstract class CommandNode {
    key: string
    description: string
    abstract type: ActionType

    perform() {}

    constructor(key: string, description: string) {
        this.key = key
        this.description = description
    }

    present(): string {
        return `\[ ${this.key}\ ] - ${this.description}`
    }
}
