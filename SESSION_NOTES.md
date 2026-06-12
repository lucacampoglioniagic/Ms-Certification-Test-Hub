# Session Notes — MS Certification Test Hub

---

## Session 2026-06-12

### What was done
- **AI-900 ampliata**: aggiunte 30 nuove domande (da 6 a 36 totali) — commit `93a37fe`
  - Distribuzione per topic: Carichi AI 6, ML 5, Computer Vision 6, NLP 6, AI Generativa 7
  - Mix tipi: single 14, multiple 8, truefalse 5, ordering 3
  - Mix difficoltà: easy 9, medium 13, hard 8
- **AZ-900 completata**: pushate 40 domande precedentemente non committate (da 12 a 52 su Git) — commit `cff3350`
  - Fix al validatore `scripts/validate-questions.mjs`: limite opzioni per tipo `ordering` alzato da 6 a 7
- **Documentazione aggiornata** — commit `5439d28`
  - `README.md`: conteggio domande aggiornato (AZ-900 12→52, AI-900 6→36)
  - `CONTRIBUTING-QUESTIONS.md`: limite opzioni `ordering` documentato come 2-7 (invece di 2-6)

### Decisions made
- Tipo `ordering` supporta fino a **7 opzioni** (non 6): il validatore e la documentazione sono ora allineati
- Distribuzione domande AI-900 segue i pesi ufficiali Microsoft per l'esame AI-900
- Convenzione difficoltà: easy/medium/hard distribuiti in modo bilanciato su ogni certificazione
- Tutti i contributi vengono validati via `scripts/validate-questions.mjs` prima del push

### Current status
- **AZ-900**: 52 domande ✅ — pushato su `main`
- **AI-900**: 36 domande ✅ — pushato su `main`
- **GH-300**: 52 domande ✅ — già presente da sessioni precedenti
- Build e validazione OK su tutti e tre i questionari
- HEAD: `5439d28` su `main` (sincronizzato con `origin/main`)

### Next steps
- Espandere **AI-900** verso quota 52 domande (analogia con AZ-900 e GH-300)
- Valutare aggiunta nuova certificazione (es. DP-900, SC-900, o AZ-104)
- Potenziale miglioramento UX: filtro per difficoltà nella schermata di selezione quiz
- Considerare aggiunta di spiegazioni estese (`explanation` field) per le domande senza link Learn

### Files changed
- `public/data/questions/ai-900.json` — 30 nuove domande aggiunte (563 righe)
- `public/data/questions/az-900.json` — 40 nuove domande aggiunte (724 righe)
- `public/data/index.json` — conteggi topic AI-900 aggiornati
- `scripts/validate-questions.mjs` — fix limite opzioni `ordering` (max 7)
- `README.md` — conteggi domande aggiornati
- `CONTRIBUTING-QUESTIONS.md` — documentazione limite `ordering` corretta

---
