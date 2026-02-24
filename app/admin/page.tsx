"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><div className="text-4xl animate-float">🔧</div></div>}>
      <AdminPage />
    </Suspense>
  );
}

type Question = {
  id: string;
  question: string;
  reponse_a: string;
  reponse_b: string;
  reponse_c: string;
  reponse_d: string;
  bonne_reponse: string;
  is_custom: boolean;
};

type Matiere = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
};

type EleveStats = {
  id: string;
  name: string;
  niveau: number;
  total_carottes: number;
  parties_aujourd_hui: number;
};

const ADMIN_CODE = "admin";

function AdminPage() {
  const searchParams = useSearchParams();
  const [adminCode, setAdminCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [codeClasse, setCodeClasse] = useState(searchParams.get("classe") || "");
  const [classeId, setClasseId] = useState<string | null>(null);
  const [classeName, setClasseName] = useState("");
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [eleves, setEleves] = useState<EleveStats[]>([]);
  const [tab, setTab] = useState<"questions" | "eleves">("questions");
  const [loading, setLoading] = useState(false);

  // Formulaire nouvelle question
  const [newQuestion, setNewQuestion] = useState("");
  const [newA, setNewA] = useState("");
  const [newB, setNewB] = useState("");
  const [newC, setNewC] = useState("");
  const [newD, setNewD] = useState("");
  const [newCorrect, setNewCorrect] = useState("a");
  const [saving, setSaving] = useState(false);

  // Formulaire nouvel élève
  const [newEleveName, setNewEleveName] = useState("");
  const [addingEleve, setAddingEleve] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("zoo_admin_auth");
    if (saved === "true") setIsAuthenticated(true);
  }, []);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (adminCode.trim().toLowerCase() === ADMIN_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem("zoo_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Code incorrect !");
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!codeClasse.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: classe } = await supabase
      .from("zoo_classes")
      .select("id, name")
      .eq("code_classe", codeClasse.trim().toUpperCase())
      .single();

    if (!classe) {
      alert("Classe introuvable !");
      setLoading(false);
      return;
    }

    setClasseId(classe.id);
    setClasseName(classe.name);

    const { data: matieresData } = await supabase.from("zoo_matieres").select("*").order("name");
    setMatieres(matieresData || []);
    if (matieresData && matieresData.length > 0) {
      setSelectedMatiere(matieresData[0].id);
    }

    const { data: elevesData } = await supabase
      .from("zoo_eleves")
      .select("id, name, niveau, total_carottes, parties_aujourd_hui")
      .eq("classe_id", classe.id)
      .order("niveau", { ascending: false });

    setEleves(elevesData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!selectedMatiere || !classeId) return;

    async function loadQuestions() {
      const supabase = createClient();
      const { data } = await supabase
        .from("zoo_questions")
        .select("*")
        .eq("matiere_id", selectedMatiere!)
        .or(`is_custom.eq.false,classe_id.eq.${classeId}`)
        .order("created_at", { ascending: false });

      setQuestions(data || []);
    }

    loadQuestions();
  }, [selectedMatiere, classeId]);

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatiere || !classeId) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("zoo_questions").insert({
      matiere_id: selectedMatiere,
      question: newQuestion,
      reponse_a: newA,
      reponse_b: newB,
      reponse_c: newC,
      reponse_d: newD,
      bonne_reponse: newCorrect,
      is_custom: true,
      classe_id: classeId,
    });

    if (!error) {
      setNewQuestion("");
      setNewA("");
      setNewB("");
      setNewC("");
      setNewD("");
      setNewCorrect("a");

      // Recharger
      const { data } = await supabase
        .from("zoo_questions")
        .select("*")
        .eq("matiere_id", selectedMatiere)
        .or(`is_custom.eq.false,classe_id.eq.${classeId}`)
        .order("created_at", { ascending: false });
      setQuestions(data || []);
    }
    setSaving(false);
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm("Supprimer cette question ?")) return;
    const supabase = createClient();
    await supabase.from("zoo_questions").delete().eq("id", id);
    setQuestions(questions.filter((q) => q.id !== id));
  }

  async function handleAddEleve(e: React.FormEvent) {
    e.preventDefault();
    if (!classeId || !newEleveName.trim()) return;
    setAddingEleve(true);

    const supabase = createClient();
    const { data: existing } = await supabase
      .from("zoo_eleves")
      .select("id")
      .eq("classe_id", classeId)
      .eq("name", newEleveName.trim())
      .single();

    if (existing) {
      alert("Cet élève existe déjà dans la classe !");
      setAddingEleve(false);
      return;
    }

    const { data: newEleve, error } = await supabase
      .from("zoo_eleves")
      .insert({ classe_id: classeId, name: newEleveName.trim() })
      .select("id, name, niveau, total_carottes, parties_aujourd_hui")
      .single();

    if (!error && newEleve) {
      setEleves([...eleves, newEleve]);
      setNewEleveName("");
    }
    setAddingEleve(false);
  }

  async function handleDeleteEleve(id: string, name: string) {
    if (!confirm(`Supprimer l'élève "${name}" et toutes ses données ? Cette action est irréversible.`)) return;
    const supabase = createClient();
    await supabase.from("zoo_eleves").delete().eq("id", id);
    setEleves(eleves.filter((e) => e.id !== id));
  }

  // Page de saisie du code admin
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="card w-full max-w-md text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-3xl font-bold text-zoo-purple">Administration</h1>
          <p className="mb-6 text-gray-500">Entrez le code d&apos;accès</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Code d'accès"
              className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-center text-xl tracking-widest focus:border-zoo-purple focus:outline-none"
              autoFocus
              required
            />
            {authError && (
              <p className="text-sm font-medium text-red-500">{authError}</p>
            )}
            <button
              type="submit"
              className="btn-primary w-full bg-gradient-to-r from-zoo-purple to-zoo-pink text-lg"
            >
              Accéder
            </button>
          </form>
          <div className="mt-4">
            <a href="/" className="text-sm text-gray-400 hover:text-zoo-purple">
              ← Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Page de connexion classe
  if (!classeId) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="card w-full max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-zoo-purple">🔧 Administration</h1>
          <p className="mb-6 text-gray-500">Entrez le code de votre classe</p>
          <form onSubmit={handleConnect} className="space-y-4">
            <input
              type="text"
              value={codeClasse}
              onChange={(e) => setCodeClasse(e.target.value.toUpperCase())}
              placeholder="Code classe (ex: 3A)"
              className="w-full rounded-[15px] border-2 border-gray-200 px-5 py-3 text-center text-xl uppercase tracking-widest focus:border-zoo-purple focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-gradient-to-r from-zoo-purple to-zoo-pink text-lg"
            >
              {loading ? "Connexion..." : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zoo-purple">🔧 Admin - {classeName}</h1>
          <p className="text-sm text-gray-400">Code : {codeClasse}</p>
        </div>
        <button
          onClick={() => { setClasseId(null); setClasseName(""); }}
          className="rounded-[10px] bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Changer de classe
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("questions")}
          className={`rounded-[15px] px-5 py-3 font-semibold transition-all ${
            tab === "questions" ? "bg-zoo-purple text-white" : "bg-white text-gray-600"
          }`}
        >
          📝 Questions
        </button>
        <button
          onClick={() => setTab("eleves")}
          className={`rounded-[15px] px-5 py-3 font-semibold transition-all ${
            tab === "eleves" ? "bg-zoo-purple text-white" : "bg-white text-gray-600"
          }`}
        >
          👥 Élèves ({eleves.length})
        </button>
      </div>

      {tab === "questions" && (
        <>
          {/* Sélection matière */}
          <div className="flex flex-wrap gap-2">
            {matieres.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMatiere(m.id)}
                className={`rounded-[10px] px-4 py-2 text-sm font-semibold transition-all ${
                  selectedMatiere === m.id
                    ? "bg-zoo-blue text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {m.emoji} {m.name}
              </button>
            ))}
          </div>

          {/* Ajouter une question */}
          <div className="card">
            <h2 className="mb-4 text-lg font-bold text-zoo-purple">Ajouter une question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question..."
                className="w-full rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Réponse A" className="rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none" required />
                <input type="text" value={newB} onChange={(e) => setNewB(e.target.value)} placeholder="Réponse B" className="rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none" required />
                <input type="text" value={newC} onChange={(e) => setNewC(e.target.value)} placeholder="Réponse C" className="rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none" required />
                <input type="text" value={newD} onChange={(e) => setNewD(e.target.value)} placeholder="Réponse D" className="rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none" required />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Bonne réponse :</label>
                <select
                  value={newCorrect}
                  onChange={(e) => setNewCorrect(e.target.value)}
                  className="rounded-[10px] border-2 border-gray-200 px-3 py-2 focus:border-zoo-purple focus:outline-none"
                >
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary ml-auto bg-zoo-blue text-sm"
                >
                  {saving ? "..." : "➕ Ajouter"}
                </button>
              </div>
            </form>
          </div>

          {/* Liste des questions */}
          <div className="card">
            <h2 className="mb-4 text-lg font-bold text-zoo-purple">
              Questions ({questions.length})
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-[10px] border-2 border-gray-100 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {q.question}
                        {q.is_custom && (
                          <span className="ml-2 rounded bg-zoo-blue/20 px-2 py-0.5 text-xs text-zoo-blue">
                            Personnalisée
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        A: {q.reponse_a} · B: {q.reponse_b} · C: {q.reponse_c} · D: {q.reponse_d}
                      </div>
                      <div className="mt-1 text-xs text-green-600 font-medium">
                        ✓ Réponse : {q.bonne_reponse.toUpperCase()}
                      </div>
                    </div>
                    {q.is_custom && (
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="rounded-[8px] bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "eleves" && (
        <>
          {/* Ajouter un élève */}
          <div className="card">
            <h2 className="mb-3 text-lg font-bold text-zoo-purple">Ajouter un élève</h2>
            <form onSubmit={handleAddEleve} className="flex gap-2">
              <input
                type="text"
                value={newEleveName}
                onChange={(e) => setNewEleveName(e.target.value)}
                placeholder="Prénom de l'élève"
                className="flex-1 rounded-[10px] border-2 border-gray-200 px-4 py-2 focus:border-zoo-purple focus:outline-none"
                maxLength={30}
                required
              />
              <button
                type="submit"
                disabled={addingEleve || !newEleveName.trim()}
                className="btn-primary bg-zoo-blue text-sm disabled:opacity-50"
              >
                {addingEleve ? "..." : "➕ Ajouter"}
              </button>
            </form>
          </div>

          {/* Liste des élèves */}
          <div className="card">
            <h2 className="mb-4 text-lg font-bold text-zoo-purple">Élèves ({eleves.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="p-3 text-sm font-semibold text-gray-600">Élève</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Niveau</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Score total</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="p-3 font-medium text-gray-800">{e.name}</td>
                      <td className="p-3">{e.niveau}</td>
                      <td className="p-3">{e.total_carottes}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteEleve(e.id, e.name)}
                          className="rounded-[8px] bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                        >
                          🗑 Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
