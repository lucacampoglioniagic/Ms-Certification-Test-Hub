import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCertifications, fetchQuestions } from "../lib/data";
import type { Certification } from "../types";

interface CertWithCount extends Certification {
  questionCount: number;
}

export default function Home() {
  const [certs, setCerts] = useState<CertWithCount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertifications()
      .then(async (list) => {
        const withCounts = await Promise.all(
          list.map(async (c) => {
            try {
              const qs = await fetchQuestions(c);
              return { ...c, questionCount: qs.length };
            } catch {
              return { ...c, questionCount: 0 };
            }
          }),
        );
        setCerts(withCounts);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page page-home">
      <section className="hero">
        <p className="hero-kicker">[ training mode attivo ]</p>
        <h1 className="hero-title">
          Preparati. Simula.
          <br />
          <span className="hero-accent">Certificati.</span>
        </h1>
        <p className="hero-sub">
          Simulazioni d'esame per le certificazioni Microsoft con feedback
          immediato, spiegazioni dettagliate e report sugli argomenti da
          rivedere.
        </p>
      </section>

      {error && <div className="alert">{error}</div>}
      {!certs && !error && (
        <div className="loading">Caricamento certificazioni…</div>
      )}

      {certs && (
        <section className="cert-grid">
          {certs.map((cert, i) => (
            <Link
              key={cert.id}
              to={`/setup/${cert.id}`}
              className="cert-card"
              style={{
                ["--accent" as string]: cert.color,
                ["--delay" as string]: `${i * 90}ms`,
              }}
            >
              <div className="cert-code">{cert.code}</div>
              <h2 className="cert-title">{cert.title}</h2>
              <p className="cert-desc">{cert.description}</p>
              <div className="cert-meta">
                <span className="cert-count">{cert.questionCount} domande</span>
                <span className="cert-cta">Inizia →</span>
              </div>
              <div className="cert-topics">
                {cert.topics.slice(0, 3).map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
                {cert.topics.length > 3 && (
                  <span className="chip chip-ghost">
                    +{cert.topics.length - 3}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
