import React from 'react'
import { HomeCard } from './HomeCard'
import hero from '../img/iaprohackiaton.jpg'
import { useNavigate } from 'react-router-dom'
import { Brain, Clock, Target, BarChart3 } from 'lucide-react'

const cardData = [
    {
        id: 1,
        title: 'Inteligencia Artificial',
        description: 'Agentes inteligentes que analizan documentos y detectan anomalias automáticamente.',
        icon: Brain
    },
    {
        id: 2,
        title: 'Ahorro de tiempo',
        description: 'Reduce hasta el 80% del tiempo de revisión manual de facturas.',
        icon: Clock
    },
    {
        id: 3,
        title: 'Mayor presición',
        description: 'Menos errores humanos, más consistencia en cada auditoria.',
        icon: Target
    },
    {
        id: 4,
        title: 'Reportes claros',
        description: 'Informes detallados y fáciles de entender para tomar mejores decisiones.',
        icon: BarChart3
    }
]

export function Homepage() {

  const navigate = useNavigate()

  return (
    <main className="home-container">
      <div className="home-banner">
        <div className="home-banner-text">
          <h1>Auditoría agéntica de facturación de siniestros</h1>
          <p>Detectamos automáticamente inconsistencias, cobros duplicados y sobreprecios en facturas de talleres antes de que un humano revise la cuenta.</p>
          <button onClick={() => navigate('/audit')}>Iniciar auditoría</button>
        </div>
        <img src={hero} alt="AuditIA" />
      </div>
      <div className="home-content">
          <h2>¿Por qué usar AuditIA?</h2>
          <p>Nuestra solución utiliza inteligencia artificial y automatización para hacer tus auditorias más rapidas, precisas y confiables</p>
          <section className="card-grid">
            {cardData.map(card => (
              <HomeCard key={card.id} title={card.title} description={card.description} icon={card.icon} />
            ))}
          </section>
        </div>
    </main>
  )
}
