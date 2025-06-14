import {proxy} from "valtio/vanilla";
import {CommandNode} from "../../shared/command-node";

export type CommandNodeVM = CommandNode & {
  parentId ?: string;
}

export const commandTreeVM = proxy({
  nodes: new Map<string, CommandNodeVM>(),
  expanded: new Set<string>(),
  selectedRootId: "root" as string,

  async loadAll() {
    window.commandAPI.getAll().then(nodes => {
      this.nodes.clear();
      nodes.forEach(node => {
        this.nodes.set(node.id, node);
      });
      nodes.forEach(node => {
        node.children.forEach((childId: string) => {
          if (this.nodes.has(childId)) {
            this.nodes.get(childId)!.parentId = node.id;
          }
        });
      });
      console.log("Command nodes loaded:", this.items());
    });
  },

  item(id: string): CommandNodeVM | undefined {
    console.log("Fetching item with ID:", id, this.nodes.get(id));
    return this.nodes.get(id);
  },

  items(): CommandNodeVM[] {
    const children = this.nodes.get(this.selectedRootId)?.children || [];
    return children.map(id => this.nodes.get(id)).filter(node => node !== undefined) as CommandNode[];
  },
});
