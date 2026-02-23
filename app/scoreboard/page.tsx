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
};

export default function ScoreboardPage() {
  const router = useRouter();
  const [eleves, setEleves] = useState<EleveScore[]>([]);
  const [loading, setLoading] = useState(true);
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
        .from("eleves")
        .select("id, name, animal_type, animal_name, animal_color, niveau, total_carottes")
        .eq("classe_id", classeId)
        .order("niveau", { ascending: false })
        .order("total_carottes", { ascending: false });

      setEleves(data || []);
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
    if (sortBy === "niveau") return b.niveau - a.niveau || b.total_carottes - a.total_carottes;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <h1 className="mb-2 text-4xl font-bold text-zoo-purple">🏆 Scoreboard</h1>
        <p className="text-gray-500">{eleves.length} animaux dans la classe</p>

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setSortBy("niveau")}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
              sortBy === "niveau"
                ? "bg-zoo-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Par niveau
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
              sortBy === "name"
                ? "bg-zoo-purple text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Par nom
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      {sorted.length >= 3 && sortBy === "niveau" && (
        <div className="card bg-gradient-to-br from-zoo-yellow to-zoo-orange p-8 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
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
                  <div className="text-4xl">{medals[podiumIndex]}</div>
                  <AnimalDisplay
                    type={e.animal_type as AnimalType}
                    color={e.animal_color as AnimalColor}
                    size="sm"
                    animated={podiumIndex === 0}
                  />
                  <div className="mt-2 text-sm font-bold">{e.name}</div>
                  <div className="text-xs">{e.animal_name}</div>
                  <div className="text-xs">Niv. {e.niveau}</div>
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
              className="card card-hover flex items-center gap-4 p-4"
              style={{ animation: `slideIn 0.3s ease-out ${index * 0.03}s both` }}
            >
              <div className="flex-shrink-0">
                <AnimalDisplay
                  type={e.animal_type as AnimalType}
                  color={e.animal_color as AnimalColor}
                  size="sm"
                  animated={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800 truncate">{e.name}</span>
                  <MedalBadge niveau={e.niveau} size="sm" />
                </div>
                <div className="text-sm text-gray-500">{e.animal_name}</div>
                <div className="text-sm text-gray-400">
                  Niv. {e.niveau} · {e.total_carottes} {animalInfo.foodEmoji}
                </div>
              </div>
              {sortBy === "niveau" && (
                <div className="text-2xl font-bold text-zoo-purple">#{index + 1}</div>
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
