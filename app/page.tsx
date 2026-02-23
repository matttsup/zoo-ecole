"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [codeClasse, setCodeClasse] = useState("");
  const [prenom, setPrenom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!codeClasse.trim() || !prenom.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    // Chercher ou créer la classe
    let { data: classe } = await supabase
      .from("classes")
      .select("id")
      .eq("code_classe", codeClasse.trim().toUpperCase())
      .single();

    if (!classe) {
      const { data: newClasse, error: createErr } = await supabase
        .from("classes")
        .insert({ name: `Classe ${codeClasse.trim().toUpperCase()}`, code_classe: codeClasse.trim().toUpperCase() })
        .select("id")
        .single();

      if (createErr || !newClasse) {
        setError("Impossible de créer la classe. Réessaie !");
        setLoading(false);
        return;
      }
      classe = newClasse;
    }

    // Chercher ou créer l'élève
    let { data: eleve } = await supabase
      .from("eleves")
      .select("id, animal_type, animal_name")
      .eq("classe_id", classe.id)
      .eq("name", prenom.trim())
      .single();

    if (!eleve) {
      const { data: newEleve, error: eleveErr } = await supabase
        .from("eleves")
        .insert({ classe_id: classe.id, name: prenom.trim() })
        .select("id, animal_type, animal_name")
        .single();

      if (eleveErr || !newEleve) {
        setError("Impossible de créer l'élève. Réessaie !");
        setLoading(false);
        return;
      }
      eleve = newEleve;
    }

    // Sauvegarder en localStorage
    localStorage.setItem("zoo_eleve_id", eleve.id);
    localStorage.setItem("zoo_classe_id", classe.id);
    localStorage.setItem("zoo_prenom", prenom.trim());

    // Si l'animal n'a pas encore de nom personnalisé, créer l'animal
    if (eleve.animal_name === "Mon animal") {
      router.push("/animal");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="card animate-bounceIn w-full max-w-md text-center">
        <div className="mb-4 text-8xl animate-float">🦁</div>
        <h1 className="mb-2 text-4xl font-bold text-zoo-purple">
          Zoo École
        </h1>
        <p className="mb-8 text-lg text-gray-500">
          Apprends en t&apos;amusant avec ton animal !
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="mb-1 block text-left text-sm font-semibold text-gray-600">
              Code de ta classe
            </label>
            <input
              type="text"
              value={codeClasse}
              onChange={(e) => setCodeClasse(e.target.value.toUpperCase())}
              placeholder="Ex: 3A"
              className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-lg font-medium text-center uppercase tracking-widest transition-colors focus:border-zoo-purple focus:outline-none"
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-left text-sm font-semibold text-gray-600">
              Ton prénom
            </label>
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Entre ton prénom"
              className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-lg font-medium transition-colors focus:border-zoo-purple focus:outline-none"
              maxLength={30}
              required
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !codeClasse.trim() || !prenom.trim()}
            className="btn-primary w-full bg-gradient-to-r from-zoo-purple to-zoo-pink text-xl disabled:opacity-50"
          >
            {loading ? "Chargement..." : "🚀 C'est parti !"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            Enseignant ? <a href="/admin" className="text-zoo-purple underline">Accès administration</a>
          </p>
        </div>
      </div>
    </div>
  );
}
