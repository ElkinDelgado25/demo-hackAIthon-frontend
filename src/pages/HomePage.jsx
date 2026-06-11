import { Bot, Gauge, Radar, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomeCard } from "./HomeCard";

const cardData = [
  {
    id: 1,
    title: "Razonamiento agentico",
    description: "Agentes especializados cruzan facturas, estimaciones y reglas de poliza en segundos.",
    icon: Bot
  },
  {
    id: 2,
    title: "Puntaje de riesgo en vivo",
    description: "Cada caso recibe un puntaje dinamico de confianza e impacto antes de la revision manual.",
    icon: Radar
  },
  {
    id: 3,
    title: "Control operativo",
    description: "Monitorea productividad, hallazgos y patrones de rechazo desde un solo espacio de trabajo.",
    icon: Gauge
  },
  {
    id: 4,
    title: "Confianza empresarial",
    description: "Creado para equipos de cumplimiento con veredictos trazables y evidencia lista para revisar.",
    icon: ShieldCheck
  }
];

export function Homepage() {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <div className="home-banner">
        <div className="home-banner-text">
          <p className="eyebrow">Auditor agentico SaaS</p>
          <h1>Auditoria autonoma de siniestros para aseguradoras modernas</h1>
          <p>
            Orquesta agentes de IA que validan documentos, detectan anomalias y entregan veredictos claros antes de pagar reclamaciones.
          </p>
          <div className="home-badge-row" aria-label="Puntos clave de la plataforma">
            <span>Triaje de casos</span>
            <span>Validacion de polizas</span>
            <span>Senales de fraude</span>
          </div>
          <div className="hero-cta-group">
            <button onClick={() => navigate("/dashboard")}>Abrir plataforma</button>
            <button className="hero-ghost" onClick={() => navigate("/dashboard/history")}>Ver historial de auditorias</button>
          </div>
          <div className="hero-kpis" aria-label="Metricas clave">
            <div className="hero-kpi">
              <strong>82%</strong>
              <span>ciclo de auditoria mas rapido</span>
            </div>
            <div className="hero-kpi">
              <strong>99.1%</strong>
              <span>decisiones trazables</span>
            </div>
            <div className="hero-kpi">
              <strong>24/7</strong>
              <span>monitoreo de agentes</span>
            </div>
          </div>
        </div>
        <div className="home-banner-visual" aria-hidden="true">
          <div className="hero-orb" />
          <div className="hero-panel">
            <p>Caso activo</p>
            <strong>CLM-2026-0142</strong>
            <span>Severidad: alta</span>
          </div>
          <div className="hero-panel">
            <p>Veredicto del agente</p>
            <strong>Revision humana</strong>
            <span>Posible sobrecargo +18.4%</span>
          </div>
          <div className="hero-panel">
            <p>Cola de procesamiento</p>
            <strong>126 docs/hora</strong>
            <span>8 validadores paralelos activos</span>
          </div>
        </div>
      </div>

      <div className="home-content">
        <h2>Por que los equipos eligen esta plataforma de auditoria agentica</h2>
        <p>
          Desde la recepcion hasta el veredicto final, cada paso es automatizado, observable y disenado para gobierno empresarial.
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
