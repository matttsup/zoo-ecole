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
};

type Matiere = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [partiesRestantes, setPartiesRestantes] = useState(2);

  useEffect(() => {
    async function loadData() {
      const eleveId = localStorage.getItem("zoo_eleve_id");
      if (!eleveId) {
        router.push("/");
        return;
      }

      const supabase = createClient();

      const { data: eleveData } = await supabase
        .from("eleves")
        .select("*")
        .eq("id", eleveId)
        .single();

      if (!eleveData) {
        localStorage.clear();
        router.push("/");
        return;
      }

      // Reset parties si c'est un nouveau jour
      const today = new Date().toISOString().split("T")[0];
      if (eleveData.derniere_partie !== today) {
        await supabase
          .from("eleves")
          .update({ parties_aujourd_hui: 0, derniere_partie: today })
          .eq("id", eleveId);
        eleveData.parties_aujourd_hui = 0;
      }

      setEleve(eleveData);
      setPartiesRestantes(2 - (eleveData.parties_aujourd_hui || 0));

      const { data: matieresData } = await supabase
        .from("matieres")
        .select("*")
        .order("name");

      setMatieres(matieresData || []);
      setLoading(false);
    }

    loadData();
  }, [router]);

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
