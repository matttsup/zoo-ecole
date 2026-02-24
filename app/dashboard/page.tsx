"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimalDisplay } from "@/components/AnimalDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { MedalBadge } from "@/components/MedalBadge";
import { ANIMALS, AnimalType, AnimalColor } from "@/lib/animals";
import { getLevel, getProgressToNextLevel, POINTS_PER_LEVEL, getMedalInfo, getNextMedalInfo } from "@/lib/levels";

type Eleve = {
  id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  niveau: number;
  total_carottes: number;
  parties_aujourd_hui: number;
  derniere_partie: string | null;
  streak_count: number;
  streak_last_date: string | null;
};

type Matiere = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
};

type Defi = {
  id: string;
  question: {
    id: string;
    question: string;
    reponse_a: string;
    reponse_b: string;
    reponse_c: string;
    reponse_d: string;
    bonne_reponse: string;
  };
  alreadyAnswered: boolean;
  wasCorrect: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [partiesRestantes, setPartiesRestantes] = useState(2);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [defiAnswer, setDefiAnswer] = useState<string | null>(null);
  const [defiRevealed, setDefiRevealed] = useState(false);

  useEffect(() => {
    async function loadData() {
      const eleveId = localStorage.getItem("zoo_eleve_id");
      const classeId = localStorage.getItem("zoo_classe_id");
      if (!eleveId) {
        router.push("/");
        return;
      }

      const supabase = createClient();

      const { data: eleveData } = await supabase
        .from("zoo_eleves")
        .select("*")
        .eq("id", eleveId)
        .single();

      if (!eleveData) {
        localStorage.clear();
        router.push("/");
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      // Streak logic
      const lastDate = eleveData.streak_last_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (lastDate !== today) {
        let newStreak = 1;
        if (lastDate === yesterday) {
          newStreak = (eleveData.streak_count || 0) + 1;
        }
        await supabase
          .from("zoo_eleves")
          .update({
            parties_aujourd_hui: 0,
            derniere_partie: today,
            streak_count: newStreak,
            streak_last_date: today,
          })
          .eq("id", eleveId);
        eleveData.parties_aujourd_hui = 0;
        eleveData.streak_count = newStreak;
        eleveData.streak_last_date = today;
      }

      setEleve(eleveData);
      setPartiesRestantes(2 - (eleveData.parties_aujourd_hui || 0));

      const { data: matieresData } = await supabase
        .from("zoo_matieres")
        .select("*")
        .order("name");

      setMatieres(matieresData || []);

      // Charger le défi du jour
      if (classeId) {
        let { data: defiData } = await supabase
          .from("zoo_defis")
          .select("id, question_id")
          .eq("classe_id", classeId)
          .eq("defi_date", today)
          .single();

        if (!defiData) {
          // Créer le défi du jour : question aléatoire
          const { data: randomQ } = await supabase
            .from("zoo_questions")
            .select("id")
            .limit(50);

          if (randomQ && randomQ.length > 0) {
            const picked = randomQ[Math.floor(Math.random() * randomQ.length)];
            const { data: created } = await supabase
              .from("zoo_defis")
              .insert({ classe_id: classeId, question_id: picked.id, defi_date: today })
              .select("id, question_id")
              .single();
            defiData = created;
          }
        }

        if (defiData) {
          const { data: questionData } = await supabase
            .from("zoo_questions")
            .select("id, question, reponse_a, reponse_b, reponse_c, reponse_d, bonne_reponse")
            .eq("id", defiData.question_id)
            .single();

          const { data: existingAnswer } = await supabase
            .from("zoo_defi_reponses")
            .select("est_correcte")
            .eq("defi_id", defiData.id)
            .eq("eleve_id", eleveId)
            .single();

          if (questionData) {
            setDefi({
              id: defiData.id,
              question: questionData,
              alreadyAnswered: !!existingAnswer,
              wasCorrect: existingAnswer?.est_correcte || false,
            });
          }
        }
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  async function handleDefiAnswer(answer: string) {
    if (!defi || defi.alreadyAnswered || defiRevealed) return;
    const eleveId = localStorage.getItem("zoo_eleve_id");
    if (!eleveId) return;

    const isCorrect = answer === defi.question.bonne_reponse;
    setDefiAnswer(answer);
    setDefiRevealed(true);

    const supabase = createClient();
    await supabase.from("zoo_defi_reponses").insert({
      defi_id: defi.id,
      eleve_id: eleveId,
      reponse_donnee: answer,
      est_correcte: isCorrect,
    });

    if (isCorrect && eleve) {
      const newTotal = eleve.total_carottes + 1;
      const newNiveau = Math.floor(newTotal / 10);
      await supabase
        .from("zoo_eleves")
        .update({ total_carottes: newTotal, niveau: newNiveau })
        .eq("id", eleveId);
      setEleve({ ...eleve, total_carottes: newTotal, niveau: newNiveau });
    }

    setDefi({ ...defi, alreadyAnswered: true, wasCorrect: isCorrect });
  }

  if (loading || !eleve) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-4xl animate-float">🦁</div>
      </div>
    );
  }

  const niveau = getLevel(eleve.total_carottes);
  const progress = getProgressToNextLevel(eleve.total_carottes);
  const nextMedal = getNextMedalInfo(niveau);
  const animalInfo = ANIMALS[eleve.animal_type as AnimalType];

  return (
    <div className="space-y-6">
      {/* En-tête avec animal */}
      <div className="card animate-bounceIn text-center">
        <div className="mb-2 text-sm font-medium text-gray-400">
          Bienvenue, {eleve.name} !
        </div>

        <AnimalDisplay
          type={eleve.animal_type as AnimalType}
          color={eleve.animal_color as AnimalColor}
          name={eleve.animal_name}
          size="xl"
          niveau={niveau}
        />

        <div className="mt-4 flex items-center justify-center gap-4">
          <MedalBadge niveau={niveau} size="lg" />
          <div>
            <div className="text-3xl font-bold text-zoo-purple">Niveau {niveau}</div>
            <div className="text-sm text-gray-500">
              {eleve.total_carottes} {animalInfo.foodEmoji} au total
            </div>
          </div>
        </div>

        {/* Streak */}
        {(eleve.streak_count || 0) > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5">
            <span className={`text-xl ${(eleve.streak_count || 0) >= 3 ? "animate-streak-fire" : ""}`}>🔥</span>
            <span className="font-bold text-orange-600">
              {eleve.streak_count} jour{(eleve.streak_count || 0) > 1 ? "s" : ""} de suite !
            </span>
          </div>
        )}

        {/* Barre de progression */}
        <div className="mx-auto mt-4 max-w-sm">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Prochain niveau
          </div>
          <ProgressBar current={progress} max={POINTS_PER_LEVEL} color="#9B59B6" />
        </div>

        {nextMedal && (
          <div className="mt-3 text-sm text-gray-500">
            Prochaine médaille : {getMedalInfo(nextMedal.medal === "bronze" ? 3 : nextMedal.medal === "argent" ? 5 : nextMedal.medal === "or" ? 10 : 15).emoji} dans {nextMedal.remaining} niveau{nextMedal.remaining > 1 ? "x" : ""}
          </div>
        )}

        {/* Parties restantes */}
        <div className="mt-4 rounded-[15px] bg-zoo-yellow/20 p-3">
          <span className="text-lg font-semibold">
            {partiesRestantes > 0
              ? `🎮 ${partiesRestantes} partie${partiesRestantes > 1 ? "s" : ""} restante${partiesRestantes > 1 ? "s" : ""} aujourd'hui`
              : "⏰ Reviens demain pour jouer !"}
          </span>
        </div>
      </div>

      {/* Défi du jour */}
      {defi && (
        <div className="card border-2 border-zoo-orange">
          <h2 className="mb-3 text-xl font-bold text-zoo-orange">⚡ Défi du jour</h2>
          {defi.alreadyAnswered && !defiRevealed ? (
            <div className="py-4 text-center">
              <span className="text-3xl">{defi.wasCorrect ? "✅" : "❌"}</span>
              <p className="mt-2 font-semibold text-gray-600">
                {defi.wasCorrect ? "Bravo, tu as déjà réussi le défi !" : "Tu as déjà tenté le défi d'aujourd'hui."}
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-lg font-medium text-gray-800">{defi.question.question}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["a", "b", "c", "d"] as const).map((key) => {
                  const text = defi.question[`reponse_${key}` as keyof typeof defi.question];
                  const isCorrect = key === defi.question.bonne_reponse;
                  const isSelected = defiAnswer === key;
                  let cls = "rounded-[12px] border-2 border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium transition-all hover:bg-gray-100";
                  if (defiRevealed) {
                    if (isCorrect) cls = "rounded-[12px] border-2 border-green-500 bg-green-100 px-4 py-3 text-left font-medium text-green-800";
                    else if (isSelected) cls = "rounded-[12px] border-2 border-red-500 bg-red-100 px-4 py-3 text-left font-medium text-red-800";
                    else cls = "rounded-[12px] border-2 border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium opacity-50";
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handleDefiAnswer(key)}
                      disabled={defiRevealed}
                      className={cls}
                    >
                      <span className="mr-2 font-bold uppercase">{key}.</span>
                      {text}
                    </button>
                  );
                })}
              </div>
              {defiRevealed && (
                <div className={`mt-3 text-center text-lg font-bold ${defiAnswer === defi.question.bonne_reponse ? "text-green-600" : "text-red-500"}`}>
                  {defiAnswer === defi.question.bonne_reponse
                    ? `✅ Bravo ! +1 ${animalInfo.foodEmoji}`
                    : "❌ Pas cette fois !"}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Choix des matières */}
      <div className="card">
        <h2 className="mb-4 text-2xl font-bold text-zoo-purple">
          Choisis ta matière ! 📚
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matieres.map((matiere, index) => (
            <Link
              key={matiere.id}
              href={partiesRestantes > 0 ? `/quiz?matiere=${matiere.slug}` : "#"}
              className={`card card-hover flex items-center gap-4 p-5 ${
                partiesRestantes <= 0 ? "pointer-events-none opacity-50" : ""
              }`}
              style={{ animation: `slideIn 0.3s ease-out ${index * 0.05}s both` }}
            >
              <span className="text-4xl">{matiere.emoji}</span>
              <span className="text-lg font-semibold text-gray-700">{matiere.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/profil"
          className="btn-primary bg-gradient-to-r from-zoo-blue to-zoo-green"
        >
          🐾 Mon profil & badges
        </Link>
        <Link
          href="/scoreboard"
          className="btn-primary bg-gradient-to-r from-zoo-orange to-zoo-coral"
        >
          🏆 Voir le scoreboard
        </Link>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="btn-primary bg-gray-300 text-gray-700"
        >
          🔄 Changer d&apos;élève
        </button>
      </div>
    </div>
  );
}
