import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCertifications, fetchQuestions } from "../lib/data";
import { countEligible, pickQuestions } from "../lib/quiz";
import type {
  Certification,
  Difficulty,
  Question,
  QuestionType,
} from "../types";
import { DIFFICULTY_LABELS, TYPE_LABELS } from "../types";

const ALL_TYPES: QuestionType[] = [
  "single",
  "multiple",
  "truefalse",
  "ordering",
];
const ALL_DIFFS: Difficulty[] = ["easy", "medium", "hard"];

export default function Setup() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certification | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [types, setTypes] = useState<QuestionType[]>([...ALL_TYPES]);
  const [diffs, setDiffs] = useState<Difficulty[]>([...ALL_DIFFS]);
  const [count, setCount] = useState(10);

  useEffect(() => {
    fetchCertifications()
      .then(async (list) => {
        const c = list.find((x) => x.id === certId);
        if (!c) throw new Error("Certificazione non trovata");
        setCert(c);
        setQuestions(await fetchQuestions(c));
      })
      .catch((e) => setError(e.message));
  }, [certId]);

  const available = useMemo(
    () => (questions ? countEligible(questions, types, diffs) : 0),
    [questions, types, diffs],
  );
  const effectiveCount = Math.min(count, available);

  const typeCount = (t: QuestionType) =>
    questions?.filter((q) => q.type === t).length ?? 0;
  const diffCount = (d: Difficulty) =>
    questions?.filter((q) => q.difficulty === d).length ?? 0;

  function toggle<T>(list: T[], value: T, set: (v: T[]) => void) {
    if (list.includes(value)) {
      if (list.length > 1) set(list.filter((x) => x !== value));
    } else {
      set([...list, value]);
    }
  }

  function start() {
    if (!cert || !questions || effectiveCount === 0) return;
    const picked = pickQuestions(questions, {
      certId: cert.id,
      count: effectiveCount,
      types,
      difficulties: diffs,
    });
    navigate("/exam", { state: { cert, questions: picked } });
  }

  if (error)
    return (
      <div className="page">
        <div className="alert">{error}</div>
        <Link className="btn btn-ghost" to="/">
          ← Torna alla home
        </Link>
      </div>
    );
  if (!cert || !questions)
    return (
      <div className="page">
        <div className="loading">Caricamento…</div>
      </div>
    );

  return (
    <div
      className="page page-setup"
      style={{ ["--accent" as string]: cert.color }}
    >
      <Link to="/" className="back-link">
        ← Tutte le certificazioni
      </Link>

      <header className="setup-header">
        <span className="setup-code">{cert.code}</span>
        <h1 className="setup-title">{cert.title}</h1>
        <p className="setup-desc">{cert.description}</p>
      </header>

      <div className="setup-panels">
        <section className="panel">
          <h2 className="panel-label">01 · Tipologie di domanda</h2>
          <div className="option-row">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`toggle ${types.includes(t) ? "on" : ""}`}
                onClick={() => toggle(types, t, setTypes)}
                disabled={typeCount(t) === 0}
              >
                {TYPE_LABELS[t]}
                <span className="toggle-count">{typeCount(t)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-label">02 · Difficoltà</h2>
          <div className="option-row">
            {ALL_DIFFS.map((d) => (
              <button
                key={d}
                type="button"
                className={`toggle toggle-${d} ${diffs.includes(d) ? "on" : ""}`}
                onClick={() => toggle(diffs, d, setDiffs)}
                disabled={diffCount(d) === 0}
              >
                {DIFFICULTY_LABELS[d]}
                <span className="toggle-count">{diffCount(d)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-label">03 · Numero di domande</h2>
          <div className="count-row">
            <input
              type="range"
              min={1}
              max={Math.max(available, 1)}
              value={effectiveCount || 1}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={available === 0}
            />
            <span className="count-display">{effectiveCount}</span>
          </div>
          <p className="panel-hint">
            {available} domande disponibili con i filtri selezionati
          </p>
        </section>
      </div>

      <div className="setup-actions">
        <button
          className="btn btn-primary"
          onClick={start}
          disabled={effectiveCount === 0}
        >
          Avvia simulazione ▸
        </button>
        {available === 0 && (
          <p className="panel-hint warn">
            Nessuna domanda corrisponde ai filtri scelti.
          </p>
        )}
      </div>
    </div>
  );
}
