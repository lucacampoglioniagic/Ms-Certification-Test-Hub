import type { ExamConfig, Question } from "../types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Filtra le domande per tipologia/difficoltà e ne estrae `count` casualmente. */
export function pickQuestions(all: Question[], config: ExamConfig): Question[] {
  const eligible = all.filter(
    (q) =>
      config.types.includes(q.type) &&
      config.difficulties.includes(q.difficulty),
  );
  return shuffle(eligible).slice(0, config.count);
}

/** Conta le domande disponibili per una data combinazione di filtri. */
export function countEligible(
  all: Question[],
  types: ExamConfig["types"],
  difficulties: ExamConfig["difficulties"],
): number {
  return all.filter(
    (q) => types.includes(q.type) && difficulties.includes(q.difficulty),
  ).length;
}

/** Valuta una risposta. answer: indici selezionati (o ordine scelto per ordering). */
export function evaluate(question: Question, answer: number[]): boolean {
  if (question.type === "ordering") {
    return (
      answer.length === question.correct.length &&
      answer.every((v, i) => v === question.correct[i])
    );
  }
  const a = [...answer].sort((x, y) => x - y);
  const c = [...question.correct].sort((x, y) => x - y);
  return a.length === c.length && a.every((v, i) => v === c[i]);
}

export interface TopicStat {
  topic: string;
  total: number;
  correct: number;
  pct: number;
}

export function topicStats(
  records: { question: Question; isCorrect: boolean }[],
): TopicStat[] {
  const map = new Map<string, { total: number; correct: number }>();
  for (const r of records) {
    const s = map.get(r.question.topic) ?? { total: 0, correct: 0 };
    s.total++;
    if (r.isCorrect) s.correct++;
    map.set(r.question.topic, s);
  }
  return [...map.entries()]
    .map(([topic, s]) => ({
      topic,
      ...s,
      pct: Math.round((s.correct / s.total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct);
}
