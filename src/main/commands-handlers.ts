import {MessageConsumer} from "./events-handlers";
import {CommandNode} from "../shared/command-node";
import {CommandNodeStore} from "./database/database-accessor";
import crypto from 'crypto';
import {mainModel, nodeMap, preferencesList, selectedCommandList} from "./model";
import {sendUpdateMainList} from "./event-sender";

export const commandsRegister: MessageConsumer[] = [
  {
    channel: 'commands.select',
    handler: (event, id: string): Promise<void> => {
      console.log(`[Commands] select command node with ID: ${id}`);
      if (id === mainModel.selectedRootId) {
        return;
      }
      const node = nodeMap.get(id);
      if (!node) {
        throw new Error(`Command node with ID ${id} not found`);
      }
      mainModel.selectedRootId = id;
      sendUpdateMainList(selectedCommandList());
    }
  },
  {
    channel: 'commands.children',
    handler: (event, id: string): Promise<void> => {
      console.log(`[Commands] get children nodes with ID: ${id}`);
      const node = nodeMap.get(id);
      if (!node) {
        throw new Error(`Command node with ID ${id} not found`);
      }
      const children = node.children || [];
      return children
        .map((childId: string) => nodeMap.get(childId))
        .filter(node => node !== undefined) as CommandNode[]
    }
  },
  {
    channel: 'commands.create',
    handler: (event, data: Omit<CommandNode, 'id'>, parentId: string): Promise<void> => {
      console.log(`[Commands] Creating command node with data:`, data, `under parent ID: ${parentId}`);
      const id = crypto.randomUUID();
      CommandNodeStore.instance.insert({id, ...data}, parentId);
      if (parentId === mainModel.selectedRootId) {
        sendUpdateMainList(selectedCommandList())
      }
      return id;
    }
  },
  {
    channel: 'commands.update',
    handler: (event, node: CommandNode, parentId: string): Promise<void> => {
      console.log(`[Commands] Updating command node with ID: ${node.id}`, `under parent ID: ${parentId}`);
      CommandNodeStore.instance.update(node);
      if (parentId === mainModel.selectedRootId) {
        sendUpdateMainList(selectedCommandList())
      }
    }
  },
  {
    channel: 'commands.delete',
    handler: (event, id: string, parentId: string): Promise<void> => {
      console.log(`[Commands] Deleting command node with ID: ${id}`, `under parent ID: ${parentId}`);
      CommandNodeStore.instance.delete(id, parentId);
      if (parentId === mainModel.selectedRootId) {
        sendUpdateMainList(selectedCommandList())
      }
    }
  }
]

export const preferencesRegister: MessageConsumer[] = [
  {
    channel: 'preferences.get-startup',
    handler: (event) => {
      event.returnValue = preferencesList.startup;
    }
  },
  {
    channel: 'preferences.set-startup',
    handler: (event, enabled: boolean) => {
      preferencesList.startup = enabled;
    }
  }
]
