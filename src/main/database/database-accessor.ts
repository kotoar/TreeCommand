import Database from 'better-sqlite3';
import {ActionType, CommandNode} from "../../shared/command-node";
import path from "path";
import fs from "fs";
import {app} from "electron";

interface CommandNodeRow {
  id: string;
  key: string;
  description: string;
  action_type: string;
  action_parameters: string;
  children: string;
}

export class CommandNodeStore {
  static instance: CommandNodeStore = new CommandNodeStore();
  private db: Database.Database;

  private constructor() {
    if(!app.isPackaged) {
      app.setName('Command Tree');
    }
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');
    if (fs.existsSync(dbPath)) {
      console.log(`[Database] Read existed database from ${dbPath}`);
      this.db = new Database(dbPath);
    } else {
      console.log(`[Database] Initialize new database in ${dbPath}`);
      const schemaPath = path.join(__dirname, 'static', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db = new Database(dbPath);
      this.db.exec(schema);
      this.insert({
        id: 'root',
        key: '',
        description: 'Root Node',
        actionType: 'expand',
        actionParameters: [],
        children: []
      })
    }
  }

  isValidActionType = (val: any): val is ActionType =>
    ['open', 'back', 'expand'].includes(val);

  private getNode(id: string): CommandNode | null {
    const row = this.db.prepare(`SELECT * FROM command_nodes WHERE id = ?`).get(id) as CommandNodeRow | undefined;
    if (!row) return null;
    if (!this.isValidActionType(row.action_type)) return null;
    return {
      id: row.id,
      key: row.key,
      description: row.description,
      actionType: row.action_type as ActionType,
      actionParameters: JSON.parse(row.action_parameters),
      children: JSON.parse(row.children),
    };
  }

  insert(node: CommandNode, parentId?: string): void {
    // Insert the node itself
    const stmt = this.db.prepare(`
      INSERT INTO command_nodes (id, key, description, action_type, action_parameters, children)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      node.id,
      node.key,
      node.description,
      node.actionType,
      JSON.stringify(node.actionParameters),
      JSON.stringify(node.children)
    );

    // If node has a parent, update parent's children list
    if (parentId) {
      const parentNode = this.getNode(parentId);
      if (parentNode) {
        if (!parentNode.children.includes(node.id)) {
          parentNode.children.push(node.id);
          this.update(parentNode);
        }
      }
    }
  }

  update(node: CommandNode): void {
    const stmt = this.db.prepare(`
      UPDATE command_nodes SET
        key = ?,
        description = ?,
        action_type = ?,
        action_parameters = ?,
        children = ?
      WHERE id = ?
    `);
    stmt.run(
      node.key,
      node.description,
      node.actionType,
      JSON.stringify(node.actionParameters),
      JSON.stringify(node.children),
      node.id
    );
  }

  getAll(): CommandNode[] {
    const rawRows = this.db.prepare(`SELECT * FROM command_nodes`).all() as CommandNodeRow[]
    const rows = rawRows.filter(row =>
      this.isValidActionType(row.action_type)
    );
    return rows.map(row => ({
      id: row.id,
      key: row.key,
      description: row.description,
      actionType: row.action_type as ActionType,
      actionParameters: JSON.parse(row.action_parameters),
      parent: row.id === 'root' ? '' : row.id, // Root node has no parent
      children: JSON.parse(row.children),
    }));
  }

  delete(id: string, parentId?: string): void {
    this.db.prepare(`DELETE FROM command_nodes WHERE id = ?`).run(id);
    if (parentId) {
      const parentNode = this.getNode(parentId);
      if (parentNode) {
        parentNode.children = parentNode.children.filter(childId => childId !== id);
        this.update(parentNode);
      }
    }
  }

  clear(): void {
    this.db.prepare(`DELETE FROM command_nodes`).run();
  }
}