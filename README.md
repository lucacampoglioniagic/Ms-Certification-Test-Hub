# MS Certification Test Hub

Simulatore d'esame per le certificazioni Microsoft. Interfaccia in italiano, feedback immediato dopo ogni domanda, spiegazioni dettagliate, link di approfondimento a Microsoft Learn e report finale con gli argomenti da rivedere.

**🌐 Sito live:** https://lucacampoglioniagic.github.io/Ms-Certification-Test-Hub/

## 📋 Certificazioni disponibili

| Codice | Certificazione | Domande |
|---|---|---|
| AZ-900 | Microsoft Azure Fundamentals | 52 |
| AI-900 | Microsoft Azure AI Fundamentals | 36 |
| GH-300 | GitHub Copilot | 52 |

## ✨ Funzionalità

- **Catalogo certificazioni** — la home elenca le certificazioni registrate in `public/data/index.json`
- **Simulazione configurabile** — scegli numero di domande, tipologie e difficoltà
- **4 tipologie di domanda** — scelta singola, scelta multipla, vero/falso, ordinamento
- **3 livelli di difficoltà** — base, intermedio, avanzato
- **Feedback immediato** — dopo ogni risposta vedi se è corretta, perché, e un link per approfondire
- **Report finale** — punteggio complessivo, soglia di superamento al 70%, argomenti da rivedere con statistiche per topic

## 🚀 Esecuzione locale

Prerequisiti: Node.js ≥ 20.19

```bash
npm install
npm run dev        # http://localhost:5173
```

Build di produzione (output statico in `dist/`):

```bash
npm run build
npm run preview
```

## 🌐 GitHub Pages

Il workflow `.github/workflows/deploy.yml` pubblica automaticamente il sito su GitHub Pages a ogni push su `main`. Pages è già configurato con source **GitHub Actions**; il sito è raggiungibile su https://lucacampoglioniagic.github.io/Ms-Certification-Test-Hub/.

## 📦 Architettura

- **Vite 6 + React 18 + TypeScript** — SPA statica, nessun backend
- **HashRouter** — funziona ovunque senza configurazione server
- **Dati su Git** — domande e certificazioni sono file JSON in `public/data/`, versionati nel repo: chiunque carichi contenuti li condivide con tutti

```
public/data/
├── index.json            # registro certificazioni
└── questions/*.json      # domande per certificazione
src/
├── lib/data.ts           # caricamento dati
├── lib/quiz.ts           # selezione casuale, valutazione, statistiche
└── pages/                # Home → Setup → Exam → Results
```

## ➕ Aggiungere domande e certificazioni

Vedi [CONTRIBUTING-QUESTIONS.md](CONTRIBUTING-QUESTIONS.md): schema completo dei JSON, semantica del campo `correct` per ogni tipologia e linee guida qualitative.

Il repo include l'agent dedicato **`question-curator`** (`.github/agents/question-curator.md`): si attiva quando chiedi di aggiungere una nuova certificazione (≥50 domande) o di ampliare una esistente (≥10 domande nuove). Recupera gli argomenti dalla study guide ufficiale Microsoft Learn, integra con fonti community, verifica le risposte su più fonti, evita duplicati e valida tutto con `npm run validate` prima del commit.
