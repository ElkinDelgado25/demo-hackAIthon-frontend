import { Bot, Gauge, Radar, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomeCard } from "./HomeCard";

const cardData = [
  {
    id: 1,
    title: "Agentic reasoning",
    description: "Specialized agents cross-check invoices, estimates, and policy rules in seconds.",
    icon: Bot
  },
  {
    id: 2,
    title: "Live risk scoring",
    description: "Each case gets dynamic confidence and impact scoring before manual intervention.",
    icon: Radar
  },
  {
    id: 3,
    title: "Operational control",
    description: "Track throughput, findings, and denial patterns from a single workspace.",
    icon: Gauge
  },
  {
    id: 4,
    title: "Enterprise trust",
    description: "Built for compliance teams with traceable verdicts and review-ready evidence.",
    icon: ShieldCheck
  }
];

export function Homepage() {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <div className="home-banner">
        <div className="home-banner-text">
          <p className="eyebrow">SaaS Agentic Auditor</p>
          <h1>Autonomous claims auditing for modern insurance operations</h1>
          <p>
            Orchestrate AI agents that validate documents, detect anomalies, and deliver clear verdicts before claims are paid.
          </p>
          <div className="home-badge-row" aria-label="Platform highlights">
            <span>Case triage</span>
            <span>Policy checks</span>
            <span>Fraud signals</span>
          </div>
          <div className="hero-cta-group">
            <button onClick={() => navigate("/dashboard")}>Launch platform</button>
            <button className="hero-ghost" onClick={() => navigate("/dashboard/history")}>View audit history</button>
          </div>
          <div className="hero-kpis" aria-label="Key metrics">
            <div className="hero-kpi">
              <strong>82%</strong>
              <span>faster audit cycle</span>
            </div>
            <div className="hero-kpi">
              <strong>99.1%</strong>
              <span>traceable decisions</span>
            </div>
            <div className="hero-kpi">
              <strong>24/7</strong>
              <span>agent monitoring</span>
            </div>
          </div>
        </div>
        <div className="home-banner-visual" aria-hidden="true">
          <div className="hero-orb" />
          <div className="hero-panel">
            <p>Active case</p>
            <strong>CLM-2026-0142</strong>
            <span>Severity: High</span>
          </div>
          <div className="hero-panel">
            <p>Agent verdict</p>
            <strong>Human review</strong>
            <span>Potential overcharge +18.4%</span>
          </div>
          <div className="hero-panel">
            <p>Processing queue</p>
            <strong>126 docs/hour</strong>
            <span>8 parallel validators online</span>
          </div>
        </div>
      </div>

      <div className="home-content">
        <h2>Why teams choose this agentic audit stack</h2>
        <p>
          From intake to final verdict, every step is automated, observable, and built for enterprise-level governance.
        </p>
        <section className="card-grid">
          {cardData.map((card) => (
            <HomeCard key={card.id} title={card.title} description={card.description} icon={card.icon} />
          ))}
        </section>
      </div>
    </main>
  );
}
