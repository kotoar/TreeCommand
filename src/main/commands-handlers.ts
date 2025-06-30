import {MessageConsumer} from "./events-handlers";
import {CommandNode} from "../shared/command-node";
import {CommandNodeStore} from "./database/database-accessor";
import crypto from 'crypto';
import {mainModel, nodeMap, preferencesList, selectedCommandList} from "./model";
import {sendUpdateMainList} from "./event-sender";
import {PrefStore} from "./pref-store/pref-store";
import {StartPosition} from "../shared/prefs";

interface AsyncMessageConsumer {
  channel: string;
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>;
}

export const commandsRegister: AsyncMessageConsumer[] = [
  {
    channel: 'commands.select',
    handler: async (event, id: string): Promise<void> => {
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
    handler: async (event, id: string): Promise<CommandNode[]> => {
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
    handler: async (event, data: Omit<CommandNode, 'id'>, parentId: string): Promise<string> => {
      console.log(`[Commands] Creating command node with data:`, data, `under parent ID: ${parentId}`);
      const id = crypto.randomUUID();
      const newNode: CommandNode = {id, ...data}
      CommandNodeStore.instance.insert(newNode, parentId);
      nodeMap.get(parentId)?.children?.push(id);
      nodeMap.set(id, newNode)
      if (parentId === mainModel.selectedRootId) {
        sendUpdateMainList(selectedCommandList())
      }
      return id;
    }
  },
  {
    channel: 'commands.update',
    handler: async (event, node: CommandNode, parentId: string): Promise<void> => {
      console.log(`[Commands] Updating command node with ID: ${node.id}`, `under parent ID: ${parentId}`);
      CommandNodeStore.instance.update(node);
      nodeMap.set(node.id, node);
      if (parentId === mainModel.selectedRootId) {
        sendUpdateMainList(selectedCommandList())
      }
    }
  },
  {
    channel: 'commands.delete',
    handler: async (event, id: string, parentId: string): Promise<void> => {
      console.log(`[Commands] Deleting command node with ID: ${id}`, `under parent ID: ${parentId}`);
      CommandNodeStore.instance.delete(id, parentId);
      const parentNode = nodeMap.get(parentId);
      if (!parentNode) {
        throw new Error(`Parent command node with ID ${parentId} not found`);
      }
      parentNode.children = parentNode.children.filter(childId => childId !== id);
      function deleteNodeRecursively(nodeId: string) {
        const node = nodeMap.get(nodeId);
        if (!node) return;
        node.children?.forEach(childId => deleteNodeRecursively(childId));
        nodeMap.delete(nodeId);
      }
      deleteNodeRecursively(id);
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
      if(preferencesList.startup !== enabled) {
        preferencesList.startup = enabled;
        PrefStore.instance.save(preferencesList);
      }
    }
  },
  {
    channel: 'preferences.get-position',
    handler: (event) => {
      event.returnValue = preferencesList.startPosition;
    }
  },
  {
    channel: 'preferences.set-position',
    handler: (event, pos: StartPosition) => {
      if(preferencesList.startPosition !== pos) {
        preferencesList.startPosition = pos;
        PrefStore.instance.save(preferencesList);
      }
    }
  }
]
