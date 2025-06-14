import {MessageConsumer} from "./events-handler";
import {CommandNode} from "../shared/command-node";
import {CommandNodeStore} from "./database/database-accessor";
import crypto from 'crypto';

export const commandsRegister: MessageConsumer[] = [
  {
    channel: 'commands.get-all',
    handler: async (event): Promise<CommandNode[]> => {
      return CommandNodeStore.instance.getAll();
    }
  },
  {
    channel: 'commandTree.create',
    handler: async (event, data: Omit<CommandNode, 'id'>, parentId?: string): Promise<string> => {
      const id = crypto.randomUUID();
      CommandNodeStore.instance.insert({id, ...data}, parentId);
      return id;
    }
  },
  {
    channel: 'commands.update',
    handler: async (event, node: CommandNode): Promise<void> => {
      CommandNodeStore.instance.update(node);
    }
  },
  {
    channel: 'commands.delete',
    handler: async (event, id: string, parentId?: string): Promise<void> => {
      CommandNodeStore.instance.delete(id, parentId);
    }
  }
]