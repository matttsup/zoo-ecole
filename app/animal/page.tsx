"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ANIMALS, COLORS, AnimalType, AnimalColor } from "@/lib/animals";
import { AnimalDisplay } from "@/components/AnimalDisplay";

const animalTypes = Object.keys(ANIMALS) as AnimalType[];
const colorOptions = Object.keys(COLORS) as AnimalColor[];

export default function AnimalPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AnimalType>("lapin");
  const [selectedColor, setSelectedColor] = useState<AnimalColor>("rose");
  const [animalName, setAnimalName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!animalName.trim()) return;

    setLoading(true);
    const eleveId = localStorage.getItem("zoo_eleve_id");
    if (!eleveId) {
      router.push("/");
      return;
    }

    const supabase = createClient();
    await supabase
      .from("zoo_eleves")
      .update({
        animal_type: selectedType,
        animal_color: selectedColor,
        animal_name: animalName.trim(),
      })
      .eq("id", eleveId);

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="card animate-bounceIn w-full max-w-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-zoo-purple">
          Crée ton animal ! 🎨
        </h1>

        {/* Prévisualisation */}
        <div className="mb-8 flex justify-center">
          <AnimalDisplay
            type={selectedType}
            color={selectedColor}
            name={animalName || "..."}
            size="lg"
          />
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Choix du type */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-600">
              Choisis ton animal
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

          {/* Choix de la couleur */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-600">
              Choisis sa couleur
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-12 w-12 rounded-full transition-all ${
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

          {/* Nom de l'animal */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">
              Donne-lui un nom
            </label>
            <input
              type="text"
              value={animalName}
              onChange={(e) => setAnimalName(e.target.value)}
              placeholder={`Ex: ${ANIMALS[selectedType].label}inou`}
              className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-lg font-medium transition-colors focus:border-zoo-purple focus:outline-none"
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !animalName.trim()}
            className="btn-primary w-full bg-gradient-to-r from-zoo-green to-zoo-blue text-xl disabled:opacity-50"
          >
            {loading ? "Création..." : `✨ Créer ${animalName || "mon animal"} !`}
          </button>
        </form>
      </div>
    </div>
  );
}
