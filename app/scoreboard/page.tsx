"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AnimalDisplay } from "@/components/AnimalDisplay";
import { MedalBadge } from "@/components/MedalBadge";
import { ANIMALS, AnimalType, AnimalColor } from "@/lib/animals";

type EleveScore = {
  id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  niveau: number;
  total_carottes: number;
  weeklyScore?: number;
};

export default function ScoreboardPage() {
  const router = useRouter();
  const [eleves, setEleves] = useState<EleveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"total" | "weekly">("total");
  const [sortBy, setSortBy] = useState<"niveau" | "name">("niveau");

  useEffect(() => {
    async function loadScoreboard() {
      const classeId = localStorage.getItem("zoo_classe_id");
      if (!classeId) {
        router.push("/");
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("zoo_eleves")
        .select("id, name, animal_type, animal_name, animal_color, niveau, total_carottes")
        .eq("classe_id", classeId)
        .order("niveau", { ascending: false })
        .order("total_carottes", { ascending: false });

      const elevesData = data || [];

      // Charger les scores de la semaine
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const weekStart = startOfWeek.toISOString().split("T")[0];

      const eleveIds = elevesData.map((e) => e.id);
      if (eleveIds.length > 0) {
        const { data: weeklyParties } = await supabase
          .from("zoo_parties")
          .select("eleve_id, score")
          .in("eleve_id", eleveIds)
          .gte("played_at", weekStart);

        const weeklyMap: Record<string, number> = {};
        if (weeklyParties) {
          for (const p of weeklyParties) {
            weeklyMap[p.eleve_id] = (weeklyMap[p.eleve_id] || 0) + p.score;
          }
        }

        for (const e of elevesData) {
          e.weeklyScore = weeklyMap[e.id] || 0;
        }
      }

      setEleves(elevesData);
      setLoading(false);
    }

    loadScoreboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-4xl animate-float">🏆</div>
      </div>
    );
  }

  const sorted = [...eleves].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (period === "weekly") return (b.weeklyScore || 0) - (a.weeklyScore || 0);
    return b.niveau - a.niveau || b.total_carottes - a.total_carottes;
  });

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <h1 className="mb-2 text-3xl font-bold text-zoo-purple sm:text-4xl">🏆 Scoreboard</h1>
        <p className="text-gray-500">{eleves.length} animaux dans la classe</p>

        {/* Période */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => { setPeriod("total"); setSortBy("niveau"); }}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
              period === "total"
                ? "bg-zoo-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🏅 Total
          </button>
          <button
            onClick={() => { setPeriod("weekly"); setSortBy("niveau"); }}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
              period === "weekly"
                ? "bg-zoo-orange text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            📅 Cette semaine
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
              sortBy === "name"
                ? "bg-zoo-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🔤 Par nom
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {sorted.length >= 3 && sortBy !== "name" && (
        <div className="card bg-gradient-to-br from-zoo-yellow to-zoo-orange p-6 text-white sm:p-8">
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
            {[1, 0, 2].map((podiumIndex) => {
              const e = sorted[podiumIndex];
              if (!e) return null;
              const medals = ["🥇", "🥈", "🥉"];
              const sizes = ["scale-110", "scale-100", "scale-100"];
              return (
                <div
                  key={e.id}
                  className={`${podiumIndex === 0 ? "order-2" : podiumIndex === 1 ? "order-1" : "order-3"} ${sizes[podiumIndex]}`}
                >
                  <div className="text-3xl sm:text-4xl">{medals[podiumIndex]}</div>
                  <AnimalDisplay
                    type={e.animal_type as AnimalType}
                    color={e.animal_color as AnimalColor}
                    size="sm"
                    animated={podiumIndex === 0}
                    niveau={e.niveau}
                  />
                  <div className="mt-2 text-xs font-bold sm:text-sm">{e.name}</div>
                  <div className="text-[10px] sm:text-xs">{e.animal_name}</div>
                  <div className="text-[10px] sm:text-xs">
                    {period === "weekly" ? `${e.weeklyScore || 0} pts` : `Niv. ${e.niveau}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste complète */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((e, index) => {
          const animalInfo = ANIMALS[e.animal_type as AnimalType];
          return (
            <div
              key={e.id}
              className="card card-hover flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
              style={{ animation: `slideIn 0.3s ease-out ${index * 0.03}s both` }}
            >
              <div className="flex-shrink-0">
                <AnimalDisplay
                  type={e.animal_type as AnimalType}
                  color={e.animal_color as AnimalColor}
                  size="sm"
                  animated={false}
                  niveau={e.niveau}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-800 truncate sm:text-lg">{e.name}</span>
                  <MedalBadge niveau={e.niveau} size="sm" />
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">{e.animal_name}</div>
                <div className="text-xs text-gray-400 sm:text-sm">
                  {period === "weekly"
                    ? `${e.weeklyScore || 0} pts cette semaine`
                    : `Niv. ${e.niveau} · ${e.total_carottes} ${animalInfo.foodEmoji}`}
                </div>
              </div>
              {sortBy !== "name" && (
                <div className="text-xl font-bold text-zoo-purple sm:text-2xl">#{index + 1}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="btn-primary inline-block bg-gradient-to-r from-zoo-purple to-zoo-pink"
        >
          🏠 Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
