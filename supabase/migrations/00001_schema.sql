-- Zoo École - Schema complet

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code_classe TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Élèves avec leur animal
CREATE TABLE IF NOT EXISTS eleves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classe_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL DEFAULT 'lapin',
  animal_name TEXT NOT NULL DEFAULT 'Mon animal',
  animal_color TEXT NOT NULL DEFAULT 'rose',
  niveau INTEGER NOT NULL DEFAULT 0,
  total_carottes INTEGER NOT NULL DEFAULT 0,
  parties_aujourd_hui INTEGER NOT NULL DEFAULT 0,
  derniere_partie DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classe_id, name)
);

-- Matières
CREATE TABLE IF NOT EXISTS matieres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL
);

-- Questions (globales + custom par classe)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matiere_id UUID NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  reponse_a TEXT NOT NULL,
  reponse_b TEXT NOT NULL,
  reponse_c TEXT NOT NULL,
  reponse_d TEXT NOT NULL,
  bonne_reponse TEXT NOT NULL CHECK (bonne_reponse IN ('a', 'b', 'c', 'd')),
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  classe_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties jouées
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id UUID NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  matiere_id UUID NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses individuelles
CREATE TABLE IF NOT EXISTS reponses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partie_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reponse_donnee TEXT NOT NULL,
  est_correcte BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS permissif (pas d'auth)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reponses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_eleves" ON eleves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_matieres" ON matieres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_parties" ON parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reponses" ON reponses FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_questions_matiere ON questions(matiere_id);
CREATE INDEX IF NOT EXISTS idx_parties_eleve ON parties(eleve_id, played_at);
CREATE INDEX IF NOT EXISTS idx_reponses_partie ON reponses(partie_id);

-- Matières de base
INSERT INTO matieres (name, slug, emoji) VALUES
  ('Français', 'francais', '📖'),
  ('Anglais', 'anglais', '🇬🇧'),
  ('Mathématiques', 'math', '🔢'),
  ('Culture et citoyenneté québécoise', 'ccq', '🍁'),
  ('Univers social', 'univers-social', '🌍')
ON CONFLICT (slug) DO NOTHING;
