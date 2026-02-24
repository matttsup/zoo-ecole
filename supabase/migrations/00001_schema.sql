-- Zoo École - Schema complet (préfixé zoo_ pour coexister avec taches-classe)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes
CREATE TABLE IF NOT EXISTS zoo_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code_classe TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Élèves avec leur animal
CREATE TABLE IF NOT EXISTS zoo_eleves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classe_id UUID NOT NULL REFERENCES zoo_classes(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS zoo_matieres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL
);

-- Questions (globales + custom par classe)
CREATE TABLE IF NOT EXISTS zoo_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matiere_id UUID NOT NULL REFERENCES zoo_matieres(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  reponse_a TEXT NOT NULL,
  reponse_b TEXT NOT NULL,
  reponse_c TEXT NOT NULL,
  reponse_d TEXT NOT NULL,
  bonne_reponse TEXT NOT NULL CHECK (bonne_reponse IN ('a', 'b', 'c', 'd')),
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  classe_id UUID REFERENCES zoo_classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties jouées
CREATE TABLE IF NOT EXISTS zoo_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  eleve_id UUID NOT NULL REFERENCES zoo_eleves(id) ON DELETE CASCADE,
  matiere_id UUID NOT NULL REFERENCES zoo_matieres(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses individuelles
CREATE TABLE IF NOT EXISTS zoo_reponses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partie_id UUID NOT NULL REFERENCES zoo_parties(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES zoo_questions(id) ON DELETE CASCADE,
  reponse_donnee TEXT NOT NULL,
  est_correcte BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS permissif (pas d'auth)
ALTER TABLE zoo_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_reponses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_zoo_classes" ON zoo_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_eleves" ON zoo_eleves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_matieres" ON zoo_matieres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_questions" ON zoo_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_parties" ON zoo_parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_reponses" ON zoo_reponses FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_zoo_eleves_classe ON zoo_eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_zoo_questions_matiere ON zoo_questions(matiere_id);
CREATE INDEX IF NOT EXISTS idx_zoo_parties_eleve ON zoo_parties(eleve_id, played_at);
CREATE INDEX IF NOT EXISTS idx_zoo_reponses_partie ON zoo_reponses(partie_id);

-- Matières de base
INSERT INTO zoo_matieres (name, slug, emoji) VALUES
  ('Français', 'francais', '📖'),
  ('Anglais', 'anglais', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
  ('Mathématiques', 'math', '🔢'),
  ('Culture et citoyenneté québécoise', 'ccq', '🍁'),
  ('Univers social', 'univers-social', '🌍')
ON CONFLICT (slug) DO NOTHING;
