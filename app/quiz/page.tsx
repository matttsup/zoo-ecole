"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ANIMALS, AnimalType, AnimalColor } from "@/lib/animals";
import { AnimalDisplay } from "@/components/AnimalDisplay";
import { ProgressBar } from "@/components/ProgressBar";

type Question = {
  id: string;
  question: string;
  reponse_a: string;
  reponse_b: string;
  reponse_c: string;
  reponse_d: string;
  bonne_reponse: string;
};

type Eleve = {
  id: string;
  name: string;
  animal_type: string;
  animal_name: string;
  animal_color: string;
  total_carottes: number;
  niveau: number;
};

export default function QuizPageWrapper() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center"><div className="text-4xl animate-float">📝</div></div>}>
      <QuizPage />
    </Suspense>
  );
}

function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matiereSlug = searchParams.get("matiere");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [matiereName, setMatiereName] = useState("");
  const [matiereEmoji, setMatiereEmoji] = useState("");
  const [loading, setLoading] = useState(true);
  const [partieId, setPartieId] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      const eleveId = localStorage.getItem("zoo_eleve_id");
      if (!eleveId || !matiereSlug) {
        router.push("/dashboard");
        return;
      }

      const supabase = createClient();

      const { data: eleveData } = await supabase
        .from("eleves")
        .select("*")
        .eq("id", eleveId)
        .single();

      if (!eleveData) {
        router.push("/");
        return;
      }

      // Vérifier limite de 2 parties
      const today = new Date().toISOString().split("T")[0];
      if (eleveData.derniere_partie === today && eleveData.parties_aujourd_hui >= 2) {
        router.push("/dashboard");
        return;
      }

      setEleve(eleveData);

      const { data: matiere } = await supabase
        .from("matieres")
        .select("id, name, emoji")
        .eq("slug", matiereSlug)
        .single();

      if (!matiere) {
        router.push("/dashboard");
        return;
      }

      setMatiereName(matiere.name);
      setMatiereEmoji(matiere.emoji);

      // Charger 10 questions aléatoires
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("matiere_id", matiere.id);

      if (!questionsData || questionsData.length === 0) {
        router.push("/dashboard");
        return;
      }

      // Mélanger et prendre 10
      const shuffled = questionsData.sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);

      // Créer la partie
      const { data: partie } = await supabase
        .from("parties")
        .insert({
          eleve_id: eleveId,
          matiere_id: matiere.id,
          score: 0,
          total_questions: shuffled.length,
        })
        .select("id")
        .single();

      if (partie) setPartieId(partie.id);

      // Incrémenter les parties
      await supabase
        .from("eleves")
        .update({
          parties_aujourd_hui: (eleveData.parties_aujourd_hui || 0) + 1,
          derniere_partie: today,
        })
        .eq("id", eleveId);

      setLoading(false);
    }

    loadQuiz();
  }, [matiereSlug, router]);

  const handleAnswer = useCallback(async (answer: string) => {
    if (showResult || !questions[currentIndex]) return;

    setSelected(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentIndex].bonne_reponse;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    const supabase = createClient();

    // Sauvegarder la réponse
    if (partieId) {
      await supabase.from("reponses").insert({
        partie_id: partieId,
        question_id: questions[currentIndex].id,
        reponse_donnee: answer,
        est_correcte: isCorrect,
      });
    }

    // Après 1.5 secondes, passer à la question suivante
    setTimeout(async () => {
      if (currentIndex + 1 >= questions.length) {
        // Fin du quiz
        const eleveId = localStorage.getItem("zoo_eleve_id");
        if (eleveId && eleve) {
          const newTotal = (eleve.total_carottes || 0) + newScore;
          const newNiveau = Math.floor(newTotal / 10);
          await supabase
            .from("eleves")
            .update({
              total_carottes: newTotal,
              niveau: newNiveau,
            })
            .eq("id", eleveId);

          if (partieId) {
            await supabase
              .from("parties")
              .update({ score: newScore })
              .eq("id", partieId);
          }
        }
        setGameOver(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelected(null);
        setShowResult(false);
      }
    }, 1500);
  }, [showResult, questions, currentIndex, score, partieId, eleve]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-4xl animate-float">📝</div>
      </div>
    );
  }

  if (gameOver && eleve) {
    const animalInfo = ANIMALS[eleve.animal_type as AnimalType];
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="card animate-bounceIn w-full max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-zoo-purple">
            {score >= 8 ? "🎉 Bravo !" : score >= 5 ? "👍 Bien joué !" : "💪 Continue !"}
          </h1>

          <div className="mb-4">
            <AnimalDisplay
              type={eleve.animal_type as AnimalType}
              color={eleve.animal_color as AnimalColor}
              name={eleve.animal_name}
              size="lg"
            />
          </div>

          <div className="mb-6 rounded-[20px] bg-zoo-green/20 p-6">
            <div className="text-5xl font-bold text-zoo-purple">{score}/10</div>
            <div className="mt-2 text-xl">
              {score} {animalInfo.foodEmoji} gagnée{score > 1 ? "s" : ""} !
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-primary bg-gradient-to-r from-zoo-purple to-zoo-pink text-lg"
            >
              🏠 Retour au tableau de bord
            </button>
            <button
              onClick={() => router.push("/scoreboard")}
              className="btn-primary bg-gradient-to-r from-zoo-orange to-zoo-coral text-lg"
            >
              🏆 Voir le scoreboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const options = [
    { key: "a", text: currentQuestion.reponse_a },
    { key: "b", text: currentQuestion.reponse_b },
    { key: "c", text: currentQuestion.reponse_c },
    { key: "d", text: currentQuestion.reponse_d },
  ];

  const animalInfo = eleve ? ANIMALS[eleve.animal_type as AnimalType] : null;

  return (
    <div className="space-y-6">
      {/* En-tête quiz */}
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{matiereEmoji} {matiereName}</div>
          <div className="text-lg font-bold text-zoo-purple">
            Question {currentIndex + 1}/{questions.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{animalInfo?.foodEmoji}</span>
          <span className="text-xl font-bold text-zoo-purple">{score}</span>
        </div>
      </div>

      {/* Question */}
      <div className="card animate-slideIn">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {currentQuestion.question}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isCorrect = option.key === currentQuestion.bonne_reponse;
            const isSelected = selected === option.key;
            let bgClass = "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200";

            if (showResult) {
              if (isCorrect) {
                bgClass = "bg-green-100 border-2 border-green-500 text-green-800";
              } else if (isSelected && !isCorrect) {
                bgClass = "bg-red-100 border-2 border-red-500 text-red-800";
              } else {
                bgClass = "bg-gray-50 border-2 border-gray-200 opacity-50";
              }
            }

            return (
              <button
                key={option.key}
                onClick={() => handleAnswer(option.key)}
                disabled={showResult}
                className={`rounded-[15px] p-4 text-left text-lg font-medium transition-all ${bgClass} ${
                  !showResult ? "hover:scale-[1.02] active:scale-[0.98]" : ""
                }`}
              >
                <span className="mr-2 inline-block w-8 rounded-full bg-white/50 text-center font-bold uppercase">
                  {option.key}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mt-4 animate-bounceIn text-center text-2xl font-bold ${
            selected === currentQuestion.bonne_reponse ? "text-green-600" : "text-red-500"
          }`}>
            {selected === currentQuestion.bonne_reponse
              ? `✅ Bonne réponse ! ${animalInfo?.foodEmoji} +1`
              : "❌ Pas tout à fait..."}
          </div>
        )}
      </div>

      {/* Progression */}
      <div className="mx-auto max-w-sm">
        <ProgressBar
          current={currentIndex + 1}
          max={questions.length}
          color="#4ECDC4"
          showLabel={false}
        />
      </div>
    </div>
  );
}
