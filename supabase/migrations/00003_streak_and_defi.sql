-- Ajout du streak sur zoo_eleves
ALTER TABLE zoo_eleves ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE zoo_eleves ADD COLUMN IF NOT EXISTS streak_last_date DATE;

-- Table des défis du jour
CREATE TABLE IF NOT EXISTS zoo_defis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classe_id UUID NOT NULL REFERENCES zoo_classes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES zoo_questions(id) ON DELETE CASCADE,
  defi_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classe_id, defi_date)
);

-- Réponses aux défis
CREATE TABLE IF NOT EXISTS zoo_defi_reponses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  defi_id UUID NOT NULL REFERENCES zoo_defis(id) ON DELETE CASCADE,
  eleve_id UUID NOT NULL REFERENCES zoo_eleves(id) ON DELETE CASCADE,
  reponse_donnee TEXT NOT NULL,
  est_correcte BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(defi_id, eleve_id)
);

-- RLS
ALTER TABLE zoo_defis ENABLE ROW LEVEL SECURITY;
ALTER TABLE zoo_defi_reponses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_zoo_defis" ON zoo_defis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_zoo_defi_reponses" ON zoo_defi_reponses FOR ALL USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_zoo_defis_classe_date ON zoo_defis(classe_id, defi_date);
CREATE INDEX IF NOT EXISTS idx_zoo_defi_reponses_defi ON zoo_defi_reponses(defi_id);
