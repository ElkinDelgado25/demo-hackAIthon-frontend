import { AlertTriangle, CheckCircle2, FileSearch, Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BusinessRulesDashboard } from "../components/BusinessRulesDashboard";
import { FileUploadSection } from "../components/FileUploadSection";
import { N8nAgentPanel } from "../components/N8nAgentPanel";
import { auditCases } from "../data/auditCases";
import { fetchCaseById, fetchCases } from "../services/caseService";
import { getAuditHistory, getAuditResult } from "../services/auditService";

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

const POLLING_INTERVAL_MS = 5 * 60 * 1000;

export function DashboardPage() {
  const [cases, setCases] = useState(auditCases);
  const [selectedCase, setSelectedCase] = useState(auditCases[0]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setSelectedCase((currentCase) => cases.find((auditCase) => auditCase.id === currentCase?.id) ?? cases[0]);
  }, [cases]);

  useEffect(() => {
    fetchCases().then((result) => setCases(result.cases));
    getAuditHistory().then(setHistory);
  }, []);

  return (
    <>
      <PageHeader eyebrow="Reto 2" title="Auditor agentico de facturacion de siniestros" />
      <Metrics cases={cases} />

      <section className="content-grid">
        <CaseInbox cases={cases} selectedCase={selectedCase} onSelectCase={setSelectedCase} />

        <div className="right-stack">
          <CaseDetail selectedCase={selectedCase} />
          <AuditHistoryPreview history={history} />
          <N8nAgentPanel auditCase={selectedCase} />
        </div>
      </section>
    </>
  );
}

export function CasesPage() {
  const [cases, setCases] = useState(auditCases);
  const [selectedCase, setSelectedCase] = useState(auditCases[0]);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [newCasesCount, setNewCasesCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const casesRef = useRef(auditCases);

  useEffect(() => {
    let isMounted = true;

    async function loadCases({ silent = false } = {}) {
      const previousCaseIds = new Set(casesRef.current.map((auditCase) => auditCase.id));
      const result = await fetchCases();

      if (!isMounted) {
        return;
      }

      const incomingCases = result.cases;
      const detectedNewCases = incomingCases.filter((auditCase) => !previousCaseIds.has(auditCase.id)).length;

      casesRef.current = incomingCases;
      setCases(incomingCases);
      setSelectedCase((currentCase) => incomingCases.find((auditCase) => auditCase.id === currentCase?.id) ?? incomingCases[0]);
      setIsUsingMock(result.source === "mock");
      setLastUpdated(new Date());

      if (silent && detectedNewCases > 0) {
        setNewCasesCount(detectedNewCases);
      }
    }

    loadCases();
    const intervalId = window.setInterval(() => loadCases({ silent: true }), POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredCases = cases.filter((auditCase) => {
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      auditCase.claimNumber.toLowerCase().includes(query) ||
      auditCase.plate?.toLowerCase().includes(query) ||
      auditCase.vehicle.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || auditCase.rawStatus === statusFilter || auditCase.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader eyebrow="Casos" title="Bandeja completa de siniestros por auditar" />
      <section className="route-panel">
        <div className="section-heading">
          <div>
            <h2>Casos recibidos</h2>
            {lastUpdated ? <p className="section-note">Actualizado: {lastUpdated.toLocaleTimeString("es-EC")}</p> : null}
          </div>
          <button className="icon-button" aria-label="Filtrar casos">
            <Filter size={18} />
          </button>
        </div>
        {isUsingMock ? <div className="form-message info">Usando datos de demostracion</div> : null}
        {newCasesCount > 0 ? (
          <div className="form-message success">{newCasesCount} caso(s) nuevo(s) detectado(s) en la ultima actualizacion.</div>
        ) : null}
        <div className="case-filters">
          <label>
            Buscar
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Codigo, placa o vehiculo"
            />
          </label>
          <label>
            Estado
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Todos</option>
              <option value="NUEVO">NUEVO</option>
              <option value="PENDIENTE_DOCUMENTOS">PENDIENTE_DOCUMENTOS</option>
              <option value="LISTO_PARA_AUDITORIA">LISTO_PARA_AUDITORIA</option>
              <option value="OBSERVADO">OBSERVADO</option>
              <option value="APROBADO">APROBADO</option>
              <option value="DENEGADO">DENEGADO</option>
              <option value="REVISION_HUMANA">REVISION_HUMANA</option>
            </select>
          </label>
        </div>
        <div className="cases-table">
          {filteredCases.map((auditCase) => (
            <CaseRow
              key={auditCase.id}
              auditCase={auditCase}
              active={auditCase.id === selectedCase?.id}
              onSelectCase={setSelectedCase}
            />
          ))}
        </div>
      </section>
      {selectedCase ? <CaseDetail selectedCase={selectedCase} compact /> : null}
      {selectedCase ? (
        <div className="page-actions">
          <Link className="primary-action" to={`/dashboard/cases/${selectedCase.claimNumber}/upload`}>
            Subir documentos
          </Link>
          <Link className="secondary-action" to={`/dashboard/cases/${selectedCase.claimNumber}`}>
            Ver detalle
          </Link>
        </div>
      ) : null}
    </>
  );
}

export function UploadsPage() {
  const selectedCase = auditCases[0];

  return (
    <>
      <PageHeader eyebrow="Archivos" title="Gestion de documentos para auditoria" />
      <FileUploadSection defaultAuditNumber={selectedCase.claimNumber} auditCase={selectedCase} />
    </>
  );
}

export function CaseDetailPage() {
  const { caseId } = useParams();
  const [auditCase, setAuditCase] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCaseById(caseId)
      .then(setAuditCase)
      .catch((requestError) => setError(requestError.message));
  }, [caseId]);

  if (error) {
    return <div className="form-message error">{error}</div>;
  }

  if (!auditCase) {
    return <div className="form-message info">Cargando caso...</div>;
  }

  return (
    <>
      <PageHeader eyebrow="Detalle" title={auditCase.claimNumber} />
      <CaseDetail selectedCase={auditCase} />
      <div className="page-actions">
        <Link className="primary-action" to={`/dashboard/cases/${auditCase.claimNumber}/upload`}>
          Subir documentos
        </Link>
        <Link className="secondary-action" to="/dashboard/cases">
          Volver a casos
        </Link>
      </div>
    </>
  );
}

export function UploadFilesPage() {
  const { caseId } = useParams();
  const [auditCase, setAuditCase] = useState(null);

  useEffect(() => {
    fetchCaseById(caseId).then(setAuditCase);
  }, [caseId]);

  if (!auditCase) {
    return <div className="form-message info">Cargando caso...</div>;
  }

  return (
    <>
      <PageHeader eyebrow="Subida" title={`Documentos para ${auditCase.claimNumber}`} />
      <CaseDetail selectedCase={auditCase} compact />
      <FileUploadSection defaultAuditNumber={auditCase.claimNumber} auditCase={auditCase} />
    </>
  );
}

export function AuditResultPage() {
  const { caseId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result ?? null);

  useEffect(() => {
    if (!result) {
      getAuditResult(caseId).then(setResult);
    }
  }, [caseId, result]);

  return (
    <>
      <PageHeader eyebrow="Resultado" title={`Resultado de auditoria ${caseId}`} />
      {result ? <AuditResultCard result={result} /> : <div className="form-message info">No hay resultado registrado para este caso.</div>}
    </>
  );
}

export function AuditHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getAuditHistory().then(setHistory);
  }, []);

  return (
    <>
      <PageHeader eyebrow="Historial" title="Ultimas auditorias ejecutadas" />
      <AuditHistoryPreview history={history} />
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
  const selectedCase = auditCases[0];

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

function Metrics({ cases }) {
  const totalAtRisk = cases.reduce((sum, item) => sum + Math.max(item.invoiceTotal - item.tariffTotal, 0), 0);
  const reviewedCases = cases.filter((item) => item.status !== "bajo").length;
  const approvedCases = cases.filter((item) => item.rawStatus === "APROBADO").length;
  const observedCases = cases.filter((item) => item.rawStatus === "OBSERVADO" || item.status === "alto").length;
  const deniedCases = cases.filter((item) => item.rawStatus === "DENEGADO").length;

  return (
    <section className="metrics" aria-label="Resumen de auditoria">
      <Metric label="Casos recibidos" value={cases.length.toString()} />
      <Metric label="Por revisar" value={reviewedCases.toString()} />
      <Metric label="Aprobados" value={approvedCases.toString()} />
      <Metric label="Observados" value={observedCases.toString()} />
      <Metric label="Denegados" value={deniedCases.toString()} />
      <Metric label="Monto observado" value={currency.format(totalAtRisk)} />
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

function CaseInbox({ cases, selectedCase, onSelectCase }) {
  return (
    <div className="case-list" aria-label="Bandeja de siniestros">
      <div className="section-heading">
        <h2>Bandeja de auditoria</h2>
        <button className="icon-button" aria-label="Filtrar casos">
          <Filter size={18} />
        </button>
      </div>
      {cases.map((auditCase) => (
        <CaseRow
          key={auditCase.id}
          auditCase={auditCase}
          active={auditCase.id === selectedCase?.id}
          onSelectCase={onSelectCase}
        />
      ))}
    </div>
  );
}

function CaseDetail({ selectedCase, compact }) {
  return (
    <article className={`case-detail ${compact ? "compact" : ""}`} aria-label="Detalle del siniestro seleccionado">
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
          <span>Placa</span>
          <strong>{selectedCase.plate ?? "Sin placa"}</strong>
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

function CaseRow({ auditCase, active, onSelectCase }) {
  const Icon = statusIcon[auditCase.status];
  const difference = auditCase.invoiceTotal - auditCase.tariffTotal;

  return (
    <button type="button" className={`case-row ${active ? "active" : ""}`} onClick={() => onSelectCase?.(auditCase)}>
      <div className={`case-icon ${auditCase.status}`}>
        <Icon size={18} />
      </div>
      <div className="case-copy">
        <strong>{auditCase.claimNumber}</strong>
        <span>{auditCase.plate ? `${auditCase.plate} - ` : ""}{auditCase.vehicle}</span>
      </div>
      <div className="case-amount">
        <strong>{currency.format(auditCase.invoiceTotal)}</strong>
        <span>{auditCase.rawStatus ?? (difference > 0 ? `+${currency.format(difference)}` : "Sin desvio")}</span>
      </div>
    </button>
  );
}

function AuditResultCard({ result }) {
  return (
    <section className="route-panel">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${result.status === "APROBADO" ? "bajo" : "alto"}`}>{result.status}</span>
          <h2>{result.auditId}</h2>
          <p>{result.summary}</p>
        </div>
        <div className="confidence">
          <strong>{Math.round((result.confidence ?? 0) * 100)}%</strong>
          <span>confianza</span>
        </div>
      </div>
      <div className="findings">
        <h3>Discrepancias</h3>
        {(result.discrepancies ?? []).map((item, index) => (
          <div className="finding" key={`${item.type}-${index}`}>
            <div>
              <strong>{item.type}</strong>
              <p>{item.message}</p>
            </div>
            <span>{item.severity}</span>
          </div>
        ))}
      </div>
      <div className="form-message info">{result.recommendation}</div>
    </section>
  );
}

function AuditHistoryPreview({ history }) {
  return (
    <section className="route-panel">
      <div className="section-heading">
        <h2>Ultimas auditorias</h2>
      </div>
      {history.length === 0 ? (
        <div className="empty-state">
          <strong>Sin auditorias ejecutadas</strong>
          <p>Cuando ejecutes una auditoria, el resultado aparecera aqui.</p>
        </div>
      ) : (
        <div className="cases-table">
          {history.slice(0, 5).map((item) => (
            <Link className="case-row" to={`/dashboard/cases/${item.caseId}/result`} key={item.auditId}>
              <div className="case-copy">
                <strong>{item.auditId}</strong>
                <span>{item.caseId}</span>
              </div>
              <div className="case-amount">
                <strong>{item.status}</strong>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString("es-EC") : "reciente"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
