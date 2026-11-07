-- Conversaciones del propietario con cada agente (chat en la oficina virtual).
CREATE TABLE IF NOT EXISTS agent_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agente_id TEXT NOT NULL REFERENCES agents(id),
  rol TEXT NOT NULL,                 -- dueño | agente
  texto TEXT NOT NULL,
  tarea_id INTEGER,                  -- si el mensaje generó una tarea
  cuando TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS chat_agente ON agent_chats(agente_id, id);
