-- Vigil / Vigil — Supabase Schema Migration
-- Run this in Supabase Dashboard → SQL Editor

-- Swarms registry
CREATE TABLE IF NOT EXISTS swarms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '⚖️',
  color TEXT DEFAULT '#4A5568',
  agents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (cases/sessions)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  swarm_id TEXT REFERENCES swarms(id),
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  agent_name TEXT,
  tool_calls JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Seed swarms
INSERT INTO swarms (id, name, description, icon, color, agents) VALUES
  ('corporate', 'Corporate Law', 'Securities, M&A, governance', '🎬', '#4A5568', '["Keyes","Bannister","Gittes","Gutman","Spade","Marlowe","Archer","Neff","Cairo","OHara","Hammer","Queen","Vance"]'),
  ('criminal', 'Criminal Defense', 'Defense strategy and case analysis', '⚖️', '#C53030', '["Holmes","Poirot","Marple","Columbo","Perry","McCoy","Wolfe","Morse","Chan","Dupin","Brown","Archer"]'),
  ('family', 'Family Law', 'Custody, divorce, and family matters', '👨‍👩‍👧', '#2B6CB0', '["Bennet","Eyre","Earnshaw","Dashwood","March","Rochester","Woodhouse","Darcy","Knightley","Ferrars","Brandon","Tilney"]'),
  ('immigration', 'Immigration Law', 'Visas, asylum, and naturalization', '🌍', '#2F855A', '["Polo","Magellan","Columbus","Darwin","Earhart","Shackleton","Cook","Vespucci","Drake","Livingstone","Hudson","Lewis"]'),
  ('ip_entertainment', 'IP & Entertainment', 'Patents, trademarks, and entertainment law', '🎭', '#6B46C1', '["Selznick","Goldwyn","Mayer","Zanuck","Warner","Thalberg","Cohn","Laemmle","Zukor","Fox","Disney","Universal"]'),
  ('personal_injury', 'Personal Injury', 'Tort claims and injury litigation', '🏥', '#DD6B20', '["House","Grey","Welby","Quincy","Trapper","Kildare","Pierce","Carter","Ross","Shepherd","Kovac","Greene"]'),
  ('real_estate', 'Real Estate', 'Property transactions and land use', '🏠', '#319795', '["Earp","Hickok","Oakley","Cody","Cassidy","Holliday","Masterson","Garrett","Horn","Starr","James","Younger"]')
ON CONFLICT (id) DO NOTHING;

-- RLS policies
ALTER TABLE swarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read swarms" ON swarms FOR SELECT USING (true);
CREATE POLICY "Users manage own conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Users manage own messages" ON messages FOR ALL USING (true);
