import { BarChart3, Brain, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import hero from "../img/iaprohackiaton.jpg";
import { HomeCard } from "./HomeCard";

const cardData = [
  {
    id: 1,
    title: "Inteligencia Artificial",
    description: "Agentes inteligentes que analizan documentos y detectan anomalias automaticamente.",
    icon: Brain
  },
  {
    id: 2,
    title: "Ahorro de tiempo",
    description: "Reduce hasta el 80% del tiempo de revision manual de facturas.",
    icon: Clock
  },
  {
    id: 3,
    title: "Mayor precision",
    description: "Menos errores humanos, mas consistencia en cada auditoria.",
    icon: Target
  },
  {
    id: 4,
    title: "Reportes claros",
    description: "Informes detallados y faciles de entender para tomar mejores decisiones.",
    icon: BarChart3
  }
];

export function Homepage() {
  const navigate = useNavigate();

  return (
    <main className="home-container">
      <div className="home-banner">
        <div className="home-banner-text">
          <p className="eyebrow">Reto 2</p>
          <h1>Auditoria agentica de facturacion de siniestros</h1>
          <p>
            Detectamos automaticamente inconsistencias, cobros duplicados y sobreprecios en facturas de talleres antes de que
            un humano revise la cuenta.
          </p>
          <button onClick={() => navigate("/dashboard")}>Iniciar auditoria</button>
        </div>
        <img src={hero} alt="AuditIA" />
      </div>

      <div className="home-content">
        <h2>Por que usar AuditIA</h2>
        <p>
          Nuestra solucion utiliza inteligencia artificial y automatizacion para hacer tus auditorias mas rapidas, precisas y
          confiables.
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
