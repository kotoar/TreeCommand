export type ActionType = 'open' | 'back' | 'expand';
export type CommandNode = {
  id: string;
  key: string;
  description: string;
  actionType: ActionType;
  actionParameters: string[];
  children: string[];  // Array of child node IDs
}