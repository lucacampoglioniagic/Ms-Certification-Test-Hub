export type QuestionType = "single" | "multiple" | "truefalse" | "ordering";
export type Difficulty = "easy" | "medium" | "hard";

export interface Certification {
  id: string;
  code: string;
  title: string;
  description: string;
  color: string;
  topics: string[];
  questionFile: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  question: string;
  options: string[];
  correct: number[];
  explanation: string;
  learnMoreUrl?: string;
}

export interface ExamConfig {
  certId: string;
  count: number;
  types: QuestionType[];
  difficulties: Difficulty[];
}

export interface AnswerRecord {
  question: Question;
  /** single/multiple/truefalse: indici selezionati; ordering: ordine scelto degli indici originali */
  answer: number[];
  isCorrect: boolean;
}

export interface ExamResult {
  cert: Certification;
  records: AnswerRecord[];
}

export const TYPE_LABELS: Record<QuestionType, string> = {
  single: "Scelta singola",
  multiple: "Scelta multipla",
  truefalse: "Vero / Falso",
  ordering: "Ordinamento",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Base",
  medium: "Intermedio",
  hard: "Avanzato",
};
