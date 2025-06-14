CREATE TABLE IF NOT EXISTS command_nodes (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  description TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_parameters TEXT NOT NULL,
  children TEXT NOT NULL
);