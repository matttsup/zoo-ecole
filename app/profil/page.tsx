"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ANIMALS, COLORS, AnimalType, AnimalColor } from "@/lib/animals";
import { AnimalDisplay } from "@/components/AnimalDisplay";
import { MedalBadge } from "@/components/MedalBadge";
import { getLevel } from "@/lib/levels";
import { getEarnedBadges, getNextBadge, BADGES } from "@/lib/badges";

const animalTypes = Object.keys(ANIMALS) as AnimalType[];
const colorOptions = Object.keys(COLORS) as AnimalColor[];

type Eleve = {
  id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  niveau: number;
  total_carottes: number;
  streak_count: number;
};

type MatiereStat = {
  name: string;
  emoji: string;
  totalScore: number;
  totalQuestions: number;
  parties: number;
};

export default function ProfilPage() {
  const router = useRouter();
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matiereStats, setMatiereStats] = useState<MatiereStat[]>([]);

  const [selectedType, setSelectedType] = useState<AnimalType>("lapin");
  const [selectedColor, setSelectedColor] = useState<AnimalColor>("rose");
  const [animalName, setAnimalName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const eleveId = localStorage.getItem("zoo_eleve_id");
      if (!eleveId) {
        router.push("/");
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("zoo_eleves")
        .select("*")
        .eq("id", eleveId)
        .single();

      if (!data) {
        localStorage.clear();
        router.push("/");
        return;
      }

      setEleve(data);
      setSelectedType(data.animal_type as AnimalType);
      setSelectedColor(data.animal_color as AnimalColor);
      setAnimalName(data.animal_name);

      // Charger stats par matière
      const { data: parties } = await supabase
        .from("zoo_parties")
        .select("score, total_questions, matiere_id, zoo_matieres(name, emoji)")
        .eq("eleve_id", eleveId);

      if (parties) {
        const statsMap: Record<string, MatiereStat> = {};
        for (const p of parties) {
          const mat = p.zoo_matieres as unknown as { name: string; emoji: string } | null;
          if (!mat) continue;
          const key = p.matiere_id;
          if (!statsMap[key]) {
            statsMap[key] = { name: mat.name, emoji: mat.emoji, totalScore: 0, totalQuestions: 0, parties: 0 };
          }
          statsMap[key].totalScore += p.score;
          statsMap[key].totalQuestions += p.total_questions;
          statsMap[key].parties += 1;
        }
        setMatiereStats(Object.values(statsMap).sort((a, b) => {
          const pctA = a.totalQuestions > 0 ? a.totalScore / a.totalQuestions : 0;
          const pctB = b.totalQuestions > 0 ? b.totalScore / b.totalQuestions : 0;
          return pctB - pctA;
        }));
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!eleve || !animalName.trim()) return;

    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("zoo_eleves")
      .update({
        animal_type: selectedType,
        animal_color: selectedColor,
        animal_name: animalName.trim(),
      })
      .eq("id", eleve.id);

    setEleve({
      ...eleve,
      animal_type: selectedType,
      animal_color: selectedColor,
      animal_name: animalName.trim(),
    });
    setEditing(false);
    setSaving(false);
  }

  if (loading || !eleve) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-4xl animate-float">🦁</div>
      </div>
    );
  }

  const niveau = getLevel(eleve.total_carottes);
  const earnedBadges = getEarnedBadges(eleve.total_carottes);
  const nextBadge = getNextBadge(eleve.total_carottes);
  const animalInfo = ANIMALS[eleve.animal_type as AnimalType];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card animate-bounceIn text-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute left-4 top-4 rounded-[10px] bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          ← Retour
        </button>

        <h1 className="mb-4 text-3xl font-bold text-zoo-purple">Mon profil</h1>

        <AnimalDisplay
          type={eleve.animal_type as AnimalType}
          color={eleve.animal_color as AnimalColor}
          name={eleve.animal_name}
          size="xl"
          niveau={niveau}
        />

        <div className="mt-4 flex items-center justify-center gap-3">
          <MedalBadge niveau={niveau} size="lg" />
          <div>
            <div className="text-2xl font-bold text-zoo-purple">{eleve.name}</div>
            <div className="text-sm text-gray-500">
              Niveau {niveau} · {eleve.total_carottes} {animalInfo.foodEmoji}
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="btn-primary mt-4 bg-gradient-to-r from-zoo-blue to-zoo-green text-sm"
        >
          {editing ? "✕ Annuler" : "✏️ Modifier mon animal"}
        </button>
      </div>

      {/* Formulaire de modification */}
      {editing && (
        <div className="card animate-slideIn">
          <h2 className="mb-4 text-xl font-bold text-zoo-purple">Modifier mon animal</h2>

          <div className="mb-6 flex justify-center">
            <AnimalDisplay
              type={selectedType}
              color={selectedColor}
              name={animalName || "..."}
              size="lg"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Type d&apos;animal
              </label>
              <div className="grid grid-cols-3 gap-3">
                {animalTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex flex-col items-center gap-1 rounded-[15px] p-3 transition-all ${
                      selectedType === type
                        ? "bg-zoo-purple/10 ring-2 ring-zoo-purple scale-105"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-3xl">{ANIMALS[type].emoji}</span>
                    <span className="text-xs font-medium text-gray-600">{ANIMALS[type].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Couleur
              </label>
              <div className="flex flex-wrap gap-3 justify-center">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full transition-all ${
                      selectedColor === color
                        ? "ring-4 ring-offset-2 ring-zoo-purple scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: COLORS[color].hex }}
                    title={COLORS[color].label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-600">
                Nom
              </label>
              <input
                type="text"
                value={animalName}
                onChange={(e) => setAnimalName(e.target.value)}
                placeholder="Nom de ton animal"
                className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-lg font-medium transition-colors focus:border-zoo-purple focus:outline-none"
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving || !animalName.trim()}
              className="btn-primary w-full bg-gradient-to-r from-zoo-green to-zoo-blue text-lg disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
            </button>
          </form>
        </div>
      )}

      {/* Streak */}
      {(eleve.streak_count || 0) > 0 && (
        <div className="card text-center">
          <span className={`text-4xl ${(eleve.streak_count || 0) >= 3 ? "animate-streak-fire inline-block" : ""}`}>🔥</span>
          <div className="mt-1 text-xl font-bold text-orange-600">
            {eleve.streak_count} jour{(eleve.streak_count || 0) > 1 ? "s" : ""} de suite !
          </div>
          <p className="text-sm text-gray-500">Continue comme ça !</p>
        </div>
      )}

      {/* Statistiques par matière */}
      {matiereStats.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-2xl font-bold text-zoo-purple">Mes matières 📊</h2>
          <div className="space-y-3">
            {matiereStats.map((stat) => {
              const pct = stat.totalQuestions > 0 ? Math.round((stat.totalScore / stat.totalQuestions) * 100) : 0;
              return (
                <div key={stat.name} className="rounded-[12px] bg-gray-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">
                      {stat.emoji} {stat.name}
                    </span>
                    <span className="text-sm font-bold text-zoo-purple">{pct}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? "#2ECC71" : pct >= 50 ? "#FFB347" : "#FF6B9D",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {stat.totalScore}/{stat.totalQuestions} bonnes réponses · {stat.parties} partie{stat.parties > 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="card">
        <h2 className="mb-4 text-2xl font-bold text-zoo-purple">Mes badges 🏆</h2>

        {earnedBadges.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-2 text-5xl opacity-30">⭐</div>
            <p className="text-gray-500">
              Pas encore de badge ! Continue à jouer pour en gagner.
            </p>
            {nextBadge && (
              <p className="mt-2 text-sm text-gray-400">
                Prochain badge : {nextBadge.emoji} {nextBadge.label} ({nextBadge.requiredCorrect - eleve.total_carottes} {animalInfo.foodEmoji} restantes)
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 rounded-[15px] bg-zoo-yellow/20 p-4 text-center"
                >
                  <span className="text-4xl">{badge.emoji}</span>
                  <span className="text-sm font-bold text-gray-800">{badge.label}</span>
                  <span className="text-xs text-gray-500">{badge.description}</span>
                </div>
              ))}
            </div>

            {nextBadge && (
              <div className="mt-4 rounded-[15px] border-2 border-dashed border-gray-200 p-4 text-center">
                <span className="text-3xl opacity-40">{nextBadge.emoji}</span>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Prochain : {nextBadge.label}
                </p>
                <p className="text-xs text-gray-400">
                  Plus que {nextBadge.requiredCorrect - eleve.total_carottes} {animalInfo.foodEmoji} !
                </p>
              </div>
            )}
          </>
        )}

        {/* Tous les badges (grisés si non obtenus) */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Tous les badges
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {BADGES.map((badge) => {
              const earned = eleve.total_carottes >= badge.requiredCorrect;
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-0.5 rounded-[10px] p-2 text-center transition-all ${
                    earned ? "bg-zoo-yellow/20" : "opacity-25"
                  }`}
                  title={earned ? `${badge.label} - ${badge.description}` : `${badge.description} pour débloquer`}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600">{badge.requiredCorrect}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
