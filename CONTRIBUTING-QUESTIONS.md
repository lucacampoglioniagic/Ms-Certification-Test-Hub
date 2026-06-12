# Guida al caricamento di domande e certificazioni

Questa guida è pensata per agent (o contributor umani) che devono aggiungere nuove certificazioni e domande al Test Hub. **Tutti i dati sono file JSON statici versionati su Git**: caricare contenuti = aprire una PR / fare push su questo repo.

## Struttura dei dati

```
public/data/
├── index.json              # Registro delle certificazioni
└── questions/
    ├── az-900.json         # Domande per certificazione (un file per cert)
    └── ai-900.json
```

## 1. Registrare una certificazione (`public/data/index.json`)

Aggiungi un oggetto all'array `certifications`:

```json
{
  "id": "az-104",
  "code": "AZ-104",
  "title": "Microsoft Azure Administrator",
  "description": "Breve descrizione in italiano della certificazione.",
  "color": "#818cf8",
  "topics": ["Identità", "Storage", "Compute", "Rete", "Monitoraggio"],
  "questionFile": "questions/az-104.json"
}
```

| Campo | Tipo | Note |
|---|---|---|
| `id` | string | univoco, kebab-case, usato nelle URL |
| `code` | string | codice ufficiale esame (es. `AZ-104`) |
| `title` | string | nome ufficiale della certificazione |
| `description` | string | 1-2 frasi, in italiano |
| `color` | string | colore accent esadecimale per la UI |
| `topics` | string[] | elenco degli argomenti d'esame (usati per il report finale) |
| `questionFile` | string | percorso relativo a `public/data/` |

## 2. Creare il file domande (`public/data/questions/{id}.json`)

```json
{
  "certificationId": "az-104",
  "questions": [ ... ]
}
```

### Schema di una domanda

```json
{
  "id": "az104-001",
  "type": "single",
  "difficulty": "medium",
  "topic": "Storage",
  "question": "Testo della domanda?",
  "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
  "correct": [1],
  "explanation": "Perché la risposta è corretta e perché le altre sono sbagliate.",
  "learnMoreUrl": "https://learn.microsoft.com/..."
}
```

| Campo | Tipo | Obbligatorio | Note |
|---|---|---|---|
| `id` | string | sì | univoco nel file, formato `{certid}-NNN` |
| `type` | `single` \| `multiple` \| `truefalse` \| `ordering` | sì | vedi sotto |
| `difficulty` | `easy` \| `medium` \| `hard` | sì | |
| `topic` | string | sì | **deve corrispondere esattamente** a uno dei `topics` della certificazione in `index.json` |
| `question` | string | sì | in italiano |
| `options` | string[] | sì (tranne `truefalse`) | 2–6 opzioni (2–7 per tipo `ordering`) |
| `correct` | number[] | sì | vedi sotto |
| `explanation` | string | sì | spiegazione mostrata dopo la risposta |
| `learnMoreUrl` | string | no | link Microsoft Learn per approfondire |

### Semantica di `correct` per tipologia

- **`single`** — un solo indice: `"correct": [2]` (la terza opzione è corretta)
- **`multiple`** — tutti gli indici corretti: `"correct": [0, 2, 4]`
- **`truefalse`** — `[0]` = Vero, `[1]` = Falso. Il campo `options` può essere omesso (la UI mostra Vero/Falso automaticamente)
- **`ordering`** — gli indici delle `options` nell'ordine corretto: `"correct": [3, 0, 2, 1]`. Le opzioni vengono mescolate dalla UI prima di essere mostrate

## 3. Linee guida qualitative

- Scrivi domande **in italiano**, in stile esame Microsoft (scenari pratici per `medium`/`hard`)
- Distribuisci le domande su tutti i `topics` e su tutte le difficoltà
- `explanation` deve spiegare sia perché la risposta corretta è giusta sia perché i distrattori sono sbagliati
- Usa sempre link `learn.microsoft.com` in `learnMoreUrl` quando possibile
- Minimo consigliato: 30+ domande per certificazione perché le simulazioni siano varie

## 4. Validazione

Prima del commit esegui sempre:

```bash
npm run validate   # node scripts/validate-questions.mjs
```

Lo script verifica automaticamente: JSON validi, id univoci, `topic` coerenti con `index.json`, indici `correct` nel range e coerenti con la tipologia, presenza di `explanation`, copertura dei topic. Deve terminare senza errori.

## 5. Agent dedicato

Nel repo è definito l'agent **`question-curator`** (`.github/agents/question-curator.md`): invocalo per aggiungere nuove certificazioni o ampliare i set di domande. Recupera gli argomenti dalle fonti ufficiali Microsoft Learn, integra con fonti community, fa verifica incrociata delle risposte su più fonti, evita duplicati e valida i dati prima del commit.
