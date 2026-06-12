import { Link, Navigate, useLocation } from "react-router-dom";
import { topicStats } from "../lib/quiz";
import type { AnswerRecord, Certification } from "../types";

interface ResultsState {
  cert: Certification;
  records: AnswerRecord[];
}

const PASS_THRESHOLD = 70;

export default function Results() {
  const location = useLocation();
  const state = location.state as ResultsState | null;
  if (!state || state.records.length === 0) return <Navigate to="/" replace />;

  const { cert, records } = state;
  const correct = records.filter((r) => r.isCorrect).length;
  const pct = Math.round((correct / records.length) * 100);
  const passed = pct >= PASS_THRESHOLD;
  const stats = topicStats(records);
  const toReview = stats.filter((s) => s.pct < PASS_THRESHOLD);

  const R = 70;
  const circumference = 2 * Math.PI * R;

  return (
    <div
      className="page page-results"
      style={{ ["--accent" as string]: cert.color }}
    >
      <header className="results-header">
        <p className="hero-kicker">[ simulazione completata · {cert.code} ]</p>
        <h1 className={`results-verdict ${passed ? "pass" : "fail"}`}>
          {passed ? "Superato" : "Non superato"}
        </h1>
      </header>

      <div className="results-grid">
        <section className="panel score-panel">
          <svg
            viewBox="0 0 160 160"
            className="score-ring"
            role="img"
            aria-label={`Punteggio ${pct}%`}
          >
            <circle cx="80" cy="80" r={R} className="ring-track" />
            <circle
              cx="80"
              cy="80"
              r={R}
              className={`ring-fill ${passed ? "pass" : "fail"}`}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
            />
            <text x="80" y="76" textAnchor="middle" className="ring-pct">
              {pct}%
            </text>
            <text x="80" y="100" textAnchor="middle" className="ring-sub">
              {correct}/{records.length} corrette
            </text>
          </svg>
          <p className="panel-hint">Soglia di superamento: {PASS_THRESHOLD}%</p>
        </section>

        <section className="panel">
          <h2 className="panel-label">Argomenti da rivedere</h2>
          {toReview.length === 0 ? (
            <p className="review-clean">
              Nessuno! Ottima preparazione su tutti gli argomenti. 🎯
            </p>
          ) : (
            <ul className="review-list">
              {toReview.map((s) => (
                <li key={s.topic}>
                  <div className="review-row">
                    <span className="review-topic">{s.topic}</span>
                    <span className="review-pct">
                      {s.correct}/{s.total} · {s.pct}%
                    </span>
                  </div>
                  <div className="review-bar">
                    <div
                      className="review-bar-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {stats.length > toReview.length && (
            <>
              <h2 className="panel-label" style={{ marginTop: "1.5rem" }}>
                Argomenti solidi
              </h2>
              <ul className="review-list">
                {stats
                  .filter((s) => s.pct >= PASS_THRESHOLD)
                  .map((s) => (
                    <li key={s.topic}>
                      <div className="review-row">
                        <span className="review-topic">{s.topic}</span>
                        <span className="review-pct ok">
                          {s.correct}/{s.total} · {s.pct}%
                        </span>
                      </div>
                      <div className="review-bar">
                        <div
                          className="review-bar-fill ok"
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="panel">
        <h2 className="panel-label">Dettaglio risposte</h2>
        <ol className="detail-list">
          {records.map((r, i) => (
            <li key={r.question.id} className={r.isCorrect ? "ok" : "ko"}>
              <span className="detail-mark">{r.isCorrect ? "✓" : "✗"}</span>
              <span className="detail-q">
                {i + 1}. {r.question.question}
              </span>
              <span className="chip chip-ghost">{r.question.topic}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="setup-actions">
        <Link className="btn btn-primary" to={`/setup/${cert.id}`}>
          Riprova ▸
        </Link>
        <Link className="btn btn-ghost" to="/">
          Tutte le certificazioni
        </Link>
      </div>
    </div>
  );
}
