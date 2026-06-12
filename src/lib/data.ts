import type { Certification, Question } from "../types";

const DATA_BASE = `${import.meta.env.BASE_URL}data`;

export async function fetchCertifications(): Promise<Certification[]> {
  const res = await fetch(`${DATA_BASE}/index.json`);
  if (!res.ok)
    throw new Error("Impossibile caricare il registro delle certificazioni");
  const data = await res.json();
  return data.certifications as Certification[];
}

export async function fetchQuestions(cert: Certification): Promise<Question[]> {
  const res = await fetch(`${DATA_BASE}/${cert.questionFile}`);
  if (!res.ok)
    throw new Error(`Impossibile caricare le domande per ${cert.code}`);
  const data = await res.json();
  const questions = (data.questions as Question[]).map((q) => ({
    ...q,
    // truefalse: options implicite
    options:
      q.type === "truefalse" && !q.options?.length
        ? ["Vero", "Falso"]
        : q.options,
  }));
  return questions;
}
