import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Exam from "./pages/Exam";
import Results from "./pages/Results";

export default function App() {
  return (
    <div className="shell">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="brand-text">
            MS&nbsp;Cert <em>Test&nbsp;Hub</em>
          </span>
        </Link>
        <span className="topbar-tag">// simulatore d'esame</span>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup/:certId" element={<Setup />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>
      <footer className="footer">
        <span>
          I contenuti sono caricati da <code>public/data</code> · contribuisci
          via Git
        </span>
      </footer>
    </div>
  );
}
