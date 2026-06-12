#!/usr/bin/env node
/**
 * Valida l'integrità dei dati in public/data:
 * - index.json ben formato, id univoci, questionFile esistenti
 * - ogni file domande: schema, id univoci, topic coerenti con index.json,
 *   indici `correct` validi per tipologia, explanation presente
 * Uso: node scripts/validate-questions.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = resolve(root, 'public', 'data')

const TYPES = ['single', 'multiple', 'truefalse', 'ordering']
const DIFFS = ['easy', 'medium', 'hard']

const errors = []
const warnings = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)

function loadJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (e) {
    err(`${label}: JSON non valido — ${e.message}`)
    return null
  }
}

const index = loadJson(resolve(dataDir, 'index.json'), 'index.json')
if (!index || !Array.isArray(index.certifications)) {
  err('index.json: manca l\'array "certifications"')
} else {
  const ids = new Set()
  for (const cert of index.certifications) {
    const label = `index.json [${cert.id ?? '?'}]`
    for (const field of ['id', 'code', 'title', 'description', 'color', 'topics', 'questionFile']) {
      if (cert[field] == null || (Array.isArray(cert[field]) && cert[field].length === 0)) {
        err(`${label}: campo "${field}" mancante o vuoto`)
      }
    }
    if (cert.id) {
      if (ids.has(cert.id)) err(`${label}: id duplicato`)
      ids.add(cert.id)
      if (!/^[a-z0-9-]+$/.test(cert.id)) err(`${label}: id non kebab-case`)
    }
    if (cert.color && !/^#[0-9a-fA-F]{6}$/.test(cert.color)) err(`${label}: color non è un esadecimale valido`)

    if (!cert.questionFile) continue
    const qPath = resolve(dataDir, cert.questionFile)
    if (!existsSync(qPath)) {
      err(`${label}: questionFile "${cert.questionFile}" non esiste`)
      continue
    }
    const qData = loadJson(qPath, cert.questionFile)
    if (!qData) continue
    if (qData.certificationId !== cert.id) {
      err(`${cert.questionFile}: certificationId "${qData.certificationId}" ≠ "${cert.id}"`)
    }
    if (!Array.isArray(qData.questions) || qData.questions.length === 0) {
      err(`${cert.questionFile}: nessuna domanda`)
      continue
    }
    validateQuestions(qData.questions, cert)
  }
}

function validateQuestions(questions, cert) {
  const file = cert.questionFile
  const qids = new Set()
  const topicCount = {}
  for (const q of questions) {
    const label = `${file} [${q.id ?? '?'}]`
    if (!q.id) err(`${label}: id mancante`)
    else if (qids.has(q.id)) err(`${label}: id duplicato`)
    else qids.add(q.id)

    if (!TYPES.includes(q.type)) err(`${label}: type "${q.type}" non valido`)
    if (!DIFFS.includes(q.difficulty)) err(`${label}: difficulty "${q.difficulty}" non valida`)
    if (!q.topic || !cert.topics?.includes(q.topic)) {
      err(`${label}: topic "${q.topic}" non presente nei topics della certificazione`)
    }
    topicCount[q.topic] = (topicCount[q.topic] ?? 0) + 1
    if (!q.question?.trim()) err(`${label}: testo domanda mancante`)
    if (!q.explanation?.trim()) err(`${label}: explanation mancante`)
    if (q.learnMoreUrl && !/^https:\/\//.test(q.learnMoreUrl)) err(`${label}: learnMoreUrl non è https`)

    const optLen = q.type === 'truefalse' && !q.options?.length ? 2 : q.options?.length ?? 0
    if (q.type !== 'truefalse' && (optLen < 2 || optLen > 6)) {
      err(`${label}: servono 2-6 options (trovate ${optLen})`)
    }

    if (!Array.isArray(q.correct) || q.correct.length === 0) {
      err(`${label}: "correct" mancante o vuoto`)
      continue
    }
    if (q.correct.some((i) => !Number.isInteger(i) || i < 0 || i >= optLen)) {
      err(`${label}: indici in "correct" fuori range [0, ${optLen - 1}]`)
    }
    if (new Set(q.correct).size !== q.correct.length) err(`${label}: indici duplicati in "correct"`)

    switch (q.type) {
      case 'single':
      case 'truefalse':
        if (q.correct.length !== 1) err(`${label}: ${q.type} richiede esattamente 1 indice corretto`)
        break
      case 'multiple':
        if (q.correct.length < 2) warn(`${label}: multiple con meno di 2 risposte corrette — valuta type "single"`)
        if (q.correct.length === optLen) err(`${label}: multiple con tutte le opzioni corrette`)
        break
      case 'ordering':
        if (q.correct.length !== optLen) err(`${label}: ordering richiede tutti gli indici (${optLen})`)
        break
    }
  }

  for (const t of cert.topics ?? []) {
    if (!topicCount[t]) warn(`${file}: nessuna domanda per il topic "${t}"`)
  }
  console.log(`OK ${file}: ${questions.length} domande, topics: ${Object.entries(topicCount).map(([t, n]) => `${t}=${n}`).join(', ')}`)
}

if (warnings.length) {
  console.log('\nWarning:')
  for (const w of warnings) console.log(`  - ${w}`)
}
if (errors.length) {
  console.error('\nErrori:')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('\nValidazione superata')
