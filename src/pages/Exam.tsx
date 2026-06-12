import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { evaluate, shuffle } from "../lib/quiz";
import type { AnswerRecord, Certification, Question } from "../types";
import { DIFFICULTY_LABELS, TYPE_LABELS } from "../types";

interface ExamState {
  cert: Certification;
  questions: Question[];
}

interface DisplayOption {
  text: string;
  origIndex: number;
}

export default function Exam() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ExamState | null;

  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [ordered, setOrdered] = useState<DisplayOption[]>([]);
  const [checked, setChecked] = useState(false);

  const question = state?.questions[index];

  // opzioni mescolate per la domanda corrente (stabili finché non cambia domanda)
  const displayOptions = useMemo<DisplayOption[]>(() => {
    if (!question) return [];
    const opts = question.options.map((text, origIndex) => ({
      text,
      origIndex,
    }));
    return question.type === "truefalse" ? opts : shuffle(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id]);

  useEffect(() => {
    setSelected([]);
    setChecked(false);
    if (question?.type === "ordering") setOrdered(displayOptions);
  }, [question?.id, displayOptions, question?.type]);

  if (!state || !question) return <Navigate to="/" replace />;

  const { cert, questions } = state;
  const isLast = index === questions.length - 1;
  const currentRecord = records[index];

  function getAnswer(): number[] {
    return question!.type === "ordering"
      ? ordered.map((o) => o.origIndex)
      : selected;
  }

  function check() {
    const answer = getAnswer();
    const isCorrect = evaluate(question!, answer);
    setRecords((r) => [...r, { question: question!, answer, isCorrect }]);
    setChecked(true);
  }

  function next() {
    if (isLast) {
      navigate("/results", { state: { cert, records } });
    } else {
      setIndex((i) => i + 1);
    }
  }

  function toggleSelect(origIndex: number) {
    if (checked) return;
    if (question!.type === "multiple") {
      setSelected((s) =>
        s.includes(origIndex)
          ? s.filter((x) => x !== origIndex)
          : [...s, origIndex],
      );
    } else {
      setSelected([origIndex]);
    }
  }

  function move(i: number, dir: -1 | 1) {
    if (checked) return;
    setOrdered((o) => {
      const j = i + dir;
      if (j < 0 || j >= o.length) return o;
      const copy = [...o];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  const canCheck = question.type === "ordering" ? true : selected.length > 0;

  const correctSoFar = records.filter((r) => r.isCorrect).length;

  return (
    <div
      className="page page-exam"
      style={{ ["--accent" as string]: cert.color }}
    >
      <div className="exam-status">
        <span className="exam-cert">{cert.code}</span>
        <div className="exam-progress">
          <div className="exam-progress-bar">
            <div
              className="exam-progress-fill"
              style={{
                width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
          <span className="exam-progress-text">
            {index + 1} / {questions.length}
          </span>
        </div>
        <span className="exam-score">✓ {correctSoFar}</span>
      </div>

      <article className="question-card" key={question.id}>
        <div className="question-tags">
          <span className="chip">{TYPE_LABELS[question.type]}</span>
          <span className={`chip chip-${question.difficulty}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <span className="chip chip-ghost">{question.topic}</span>
        </div>

        <h1 className="question-text">{question.question}</h1>
        {question.type === "multiple" && (
          <p className="question-hint">Seleziona tutte le risposte corrette.</p>
        )}
        {question.type === "ordering" && (
          <p className="question-hint">Riordina gli elementi con le frecce.</p>
        )}

        {question.type !== "ordering" ? (
          <div className="options">
            {displayOptions.map((opt) => {
              const isSel = selected.includes(opt.origIndex);
              const isCorrectOpt = question.correct.includes(opt.origIndex);
              let cls = "option";
              if (!checked && isSel) cls += " selected";
              if (checked && isCorrectOpt) cls += " correct";
              if (checked && isSel && !isCorrectOpt) cls += " wrong";
              return (
                <button
                  key={opt.origIndex}
                  type="button"
                  className={cls}
                  onClick={() => toggleSelect(opt.origIndex)}
                  disabled={checked}
                >
                  <span className="option-marker">
                    {question.type === "multiple"
                      ? isSel
                        ? "☑"
                        : "☐"
                      : isSel
                        ? "●"
                        : "○"}
                  </span>
                  <span>{opt.text}</span>
                  {checked && isCorrectOpt && (
                    <span className="option-flag">✓</span>
                  )}
                  {checked && isSel && !isCorrectOpt && (
                    <span className="option-flag">✗</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="options">
            {ordered.map((opt, i) => {
              const correctHere =
                checked && question.correct[i] === opt.origIndex;
              let cls = "option option-ordering";
              if (checked) cls += correctHere ? " correct" : " wrong";
              return (
                <div key={opt.origIndex} className={cls}>
                  <span className="option-marker mono">{i + 1}.</span>
                  <span>{opt.text}</span>
                  {!checked && (
                    <span className="order-controls">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Sposta su"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === ordered.length - 1}
                        aria-label="Sposta giù"
                      >
                        ▼
                      </button>
                    </span>
                  )}
                  {checked && (
                    <span className="option-flag">
                      {correctHere ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {checked && currentRecord && (
          <div className={`feedback ${currentRecord.isCorrect ? "ok" : "ko"}`}>
            <div className="feedback-head">
              {currentRecord.isCorrect
                ? "✓ Risposta corretta"
                : "✗ Risposta errata"}
            </div>
            <p className="feedback-body">{question.explanation}</p>
            {question.learnMoreUrl && (
              <a
                className="feedback-link"
                href={question.learnMoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                Approfondisci su Microsoft Learn ↗
              </a>
            )}
          </div>
        )}

        <div className="exam-actions">
          {!checked ? (
            <button
              className="btn btn-primary"
              onClick={check}
              disabled={!canCheck}
            >
              Verifica risposta
            </button>
          ) : (
            <button className="btn btn-primary" onClick={next}>
              {isLast ? "Vedi risultati ▸" : "Prossima domanda ▸"}
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
