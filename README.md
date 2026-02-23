# 🦁 Zoo École - Apprends en t'amusant !

Application éducative gamifiée pour élèves de 3e année (programme du Québec).

## 🚀 Installation

```bash
git clone https://github.com/matttsup/zoo-ecole.git
cd zoo-ecole
npm install
npm run dev
```

L'application sera accessible sur http://localhost:3000

## ⚠️ IMPORTANT : Configuration de la base de données

Avant de lancer l'application, appliquez les migrations Supabase :

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. SQL Editor > New Query
4. Copiez-collez le contenu de `supabase/migrations/00001_schema.sql` et exécutez
5. Copiez-collez le contenu de `supabase/migrations/00002_seed_questions.sql` et exécutez

## 📝 Fonctionnalités

- 🏠 **Accueil** : Connexion par code de classe + prénom
- 🎨 **Création d'animal** : Choix du type, couleur et nom
- 📊 **Dashboard** : Animal, niveau, médailles, parties restantes
- 📝 **Quiz** : 10 questions aléatoires par partie (max 2/jour)
- 🏆 **Scoreboard** : Classement de tous les animaux de la classe
- 🔧 **Admin** : Gestion des questions + stats des élèves

## 📚 Matières (500 questions)

- 📖 Français (grammaire, conjugaison, vocabulaire)
- 🇬🇧 Anglais (vocabulaire de base, phrases simples)
- 🔢 Mathématiques (opérations, géométrie, mesures)
- 🍁 Culture et citoyenneté québécoise
- 🌍 Univers social (géographie, histoire)

## 🎮 Gamification

- Chaque bonne réponse = 1 aliment pour l'animal
- 10 aliments = 1 niveau
- Médailles : 🥉 Bronze (niv.3), 🥈 Argent (niv.5), 🥇 Or (niv.10), 💎 Diamant (niv.15)

## 🔧 Technologies

- Next.js 14 (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- TypeScript
