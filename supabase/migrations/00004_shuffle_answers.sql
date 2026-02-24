-- Mélange aléatoire de la position de la bonne réponse pour toutes les questions
DO $$
DECLARE
  rec RECORD;
  correct TEXT;
  w1 TEXT;
  w2 TEXT;
  w3 TEXT;
  rand INT;
  arr TEXT[];
  idx INT;
  tmp TEXT;
BEGIN
  FOR rec IN SELECT id, reponse_a, reponse_b, reponse_c, reponse_d FROM zoo_questions WHERE bonne_reponse = 'a' LOOP
    correct := rec.reponse_a;

    -- Mélanger les mauvaises réponses (Fisher-Yates)
    arr := ARRAY[rec.reponse_b, rec.reponse_c, rec.reponse_d];
    FOR i IN REVERSE 2..0 LOOP
      idx := floor(random() * (i + 1))::int;
      IF idx <> i THEN
        tmp := arr[i + 1];
        arr[i + 1] := arr[idx + 1];
        arr[idx + 1] := tmp;
      END IF;
    END LOOP;
    w1 := arr[1]; w2 := arr[2]; w3 := arr[3];

    -- Placer la bonne réponse aléatoirement
    rand := floor(random() * 4)::int;

    CASE rand
      WHEN 0 THEN
        UPDATE zoo_questions SET reponse_a = correct, reponse_b = w1, reponse_c = w2, reponse_d = w3, bonne_reponse = 'a' WHERE id = rec.id;
      WHEN 1 THEN
        UPDATE zoo_questions SET reponse_a = w1, reponse_b = correct, reponse_c = w2, reponse_d = w3, bonne_reponse = 'b' WHERE id = rec.id;
      WHEN 2 THEN
        UPDATE zoo_questions SET reponse_a = w1, reponse_b = w2, reponse_c = correct, reponse_d = w3, bonne_reponse = 'c' WHERE id = rec.id;
      WHEN 3 THEN
        UPDATE zoo_questions SET reponse_a = w1, reponse_b = w2, reponse_c = w3, reponse_d = correct, bonne_reponse = 'd' WHERE id = rec.id;
    END CASE;
  END LOOP;
END $$;
