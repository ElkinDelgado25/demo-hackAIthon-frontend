import { AlertTriangle, CheckCircle2, FileSearch, Filter, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { BusinessRulesDashboard } from "../components/BusinessRulesDashboard";
import { FileUploadSection } from "../components/FileUploadSection";
import { N8nAgentPanel } from "../components/N8nAgentPanel";
import { auditCases } from "../data/auditCases";

const statusCopy = {
  alto: "Riesgo alto",
  medio: "Revision",
  bajo: "Listo"
};

const statusIcon = {
  alto: AlertTriangle,
  medio: FileSearch,
  bajo: CheckCircle2
};

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const selectedCase = auditCases[0];

export function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Reto 2" title="Auditor agentico de facturacion de siniestros" />
      <Metrics />

      <section className="content-grid">
        <CaseInbox />

        <div className="right-stack">
          <CaseDetail />
          <N8nAgentPanel auditCase={selectedCase} />
        </div>
      </section>
    </>
  );
}

export function CasesPage() {
  return (
    <>
      <PageHeader eyebrow="Casos" title="Bandeja completa de siniestros por auditar" />
      <section className="route-panel">
        <div className="section-heading">
          <h2>Casos recibidos</h2>
          <button className="icon-button" aria-label="Filtrar casos">
            <Filter size={18} />
          </button>
        </div>
        <div className="cases-table">
          {auditCases.map((auditCase) => (
            <CaseRow key={auditCase.id} auditCase={auditCase} active={auditCase.id === selectedCase.id} />
          ))}
        </div>
      </section>
      <FileUploadSection defaultAuditNumber={selectedCase.claimNumber} />
    </>
  );
}

export function UploadsPage() {
  return (
    <>
      <PageHeader eyebrow="Archivos" title="Gestion de documentos para auditoria" />
      <FileUploadSection defaultAuditNumber={selectedCase.claimNumber} />
    </>
  );
}

export function RulesPage() {
  return (
    <>
      <PageHeader eyebrow="Reglas" title="Dashboard de reglas de negocio" />
      <BusinessRulesDashboard />
    </>
  );
}

export function AgentPage() {
  return (
    <>
      <PageHeader eyebrow="Agente" title="Conexion del agente auditable con n8n" />
      <N8nAgentPanel auditCase={selectedCase} />
    </>
  );
}

function PageHeader({ eyebrow, title }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <label className="search-box">
        <Search size={17} />
        <input placeholder="Buscar siniestro, taller o placa" />
      </label>
    </header>
  );
}

function Metrics() {
  const totalAtRisk = auditCases.reduce((sum, item) => sum + Math.max(item.invoiceTotal - item.tariffTotal, 0), 0);
  const reviewedCases = auditCases.filter((item) => item.status !== "bajo").length;

  return (
    <section className="metrics" aria-label="Resumen de auditoria">
      <Metric label="Casos recibidos" value={auditCases.length.toString()} />
      <Metric label="Por revisar" value={reviewedCases.toString()} />
      <Metric label="Monto observado" value={currency.format(totalAtRisk)} />
      <Metric label="Confianza promedio" value="93%" />
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CaseInbox() {
  return (
    <div className="case-list" aria-label="Bandeja de siniestros">
      <div className="section-heading">
        <h2>Bandeja de auditoria</h2>
        <button className="icon-button" aria-label="Filtrar casos">
          <Filter size={18} />
        </button>
      </div>
      {auditCases.map((auditCase) => (
        <CaseRow key={auditCase.id} auditCase={auditCase} active={auditCase.id === selectedCase.id} />
      ))}
    </div>
  );
}

function CaseDetail() {
  return (
    <article className="case-detail" aria-label="Detalle del siniestro seleccionado">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${selectedCase.status}`}>{statusCopy[selectedCase.status]}</span>
          <h2>{selectedCase.claimNumber}</h2>
          <p>{selectedCase.vehicle}</p>
        </div>
        <div className="confidence">
          <strong>{selectedCase.confidence}%</strong>
          <span>confianza</span>
        </div>
      </div>

      <div className="summary-band">
        <div>
          <span>Taller</span>
          <strong>{selectedCase.workshop}</strong>
        </div>
        <div>
          <span>Factura</span>
          <strong>{currency.format(selectedCase.invoiceTotal)}</strong>
        </div>
        <div>
          <span>Tarifario</span>
          <strong>{currency.format(selectedCase.tariffTotal)}</strong>
        </div>
      </div>

      <p className="damage">{selectedCase.reportedDamage}</p>

      <div className="findings">
        <h3>Hallazgos del agente</h3>
        {selectedCase.findings.map((finding) => (
          <div className="finding" key={finding.id}>
            <div>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
            </div>
            <span>{currency.format(finding.impact)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function CaseRow({ auditCase, active }) {
  const Icon = statusIcon[auditCase.status];
  const difference = auditCase.invoiceTotal - auditCase.tariffTotal;

  return (
    <NavLink to="/dashboard/cases" className={`case-row ${active ? "active" : ""}`}>
      <div className={`case-icon ${auditCase.status}`}>
        <Icon size={18} />
      </div>
      <div className="case-copy">
        <strong>{auditCase.claimNumber}</strong>
        <span>{auditCase.workshop}</span>
      </div>
      <div className="case-amount">
        <strong>{currency.format(auditCase.invoiceTotal)}</strong>
        <span>{difference > 0 ? `+${currency.format(difference)}` : "Sin desvio"}</span>
      </div>
    </NavLink>
  );
}
