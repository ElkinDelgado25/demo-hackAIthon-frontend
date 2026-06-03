import { AlertTriangle, CheckCircle2, FileSearch, Filter, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BusinessRulesDashboard } from "../components/BusinessRulesDashboard";
import { FileUploadSection } from "../components/FileUploadSection";
import { DenialReasonsCard, EmptyState, ErrorState, LoadingState, StatCard } from "../components/States";
import { UploadedFilesTable } from "../components/UploadedFilesTable";
import { fetchCaseById, fetchCases } from "../services/caseService";
import { generateFinalVerdict, getAllAuditHistory, getAuditHistory, getLatestAudit, runAudit } from "../services/auditService";
import { fetchDashboardStatistics, fetchDenialReasons } from "../services/statisticsService";
import { getAllDocuments } from "../services/uploadService";

const statusCopy = {
  alto: "High risk",
  medio: "Needs review",
  bajo: "Ready"
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
const unavailable = "Data unavailable";

export function DashboardPage() {
  const [statistics, setStatistics] = useState(null);
  const [denialReasons, setDenialReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setError("");

      try {
        const [dashboardStatistics, reasons] = await Promise.all([
          fetchDashboardStatistics(),
          fetchDenialReasons()
        ]);

        if (!isMounted) {
          return;
        }

        setStatistics(dashboardStatistics);
        setDenialReasons(reasons);
      } catch {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader eyebrow="Operations" title="Agentic audit command center" />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      <Metrics statistics={statistics} />

      <section className="content-grid">
        <AuditHistoryPreview history={statistics?.latestAudits ?? []} />
        <div className="right-stack">
          <DenialReasonsCard reasons={denialReasons} />
        </div>
      </section>
    </>
  );
}

export function CasesPage() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newCasesCount, setNewCasesCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const casesRef = useRef([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCases({ silent = false } = {}) {
      const previousCaseIds = new Set(casesRef.current.map((auditCase) => auditCase.id || auditCase.claimNumber));

      try {
        if (!silent) {
          setIsLoading(true);
        }

        const incomingCases = await fetchCases();
        const detectedNewCases = incomingCases.filter(
          (auditCase) => !previousCaseIds.has(auditCase.id || auditCase.claimNumber)
        ).length;

        if (!isMounted) {
          return;
        }

        casesRef.current = incomingCases;
        setCases(incomingCases);
        setSelectedCase((currentCase) =>
          incomingCases.find((auditCase) => getCaseKey(auditCase) === getCaseKey(currentCase)) ?? incomingCases[0] ?? null
        );
        setLastUpdated(new Date());
        setError("");

        if (silent && detectedNewCases > 0) {
          setNewCasesCount(detectedNewCases);
        }
      } catch {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
      <PageHeader eyebrow="Case inbox" title="End-to-end claims intake and triage" />
      <section className="route-panel">
        <div className="section-heading">
          <div>
            <h2>Incoming claims queue</h2>
            {lastUpdated ? <p className="section-note">Last sync: {lastUpdated.toLocaleTimeString("es-EC")}</p> : null}
          </div>
          <button className="icon-button" aria-label="Filter cases">
            <Filter size={18} />
          </button>
        </div>
        {isLoading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {newCasesCount > 0 ? (
          <div className="form-message success">{newCasesCount} new case(s) detected in the latest sync.</div>
        ) : null}
        <div className="case-filters">
          <label>
            Search
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Claim code, plate, or vehicle"
            />
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All</option>
              <option value="NUEVO">NUEVO</option>
              <option value="PENDIENTE_DOCUMENTOS">PENDIENTE_DOCUMENTOS</option>
              <option value="LISTO_PARA_AUDITORIA">LISTO_PARA_AUDITORIA</option>
              <option value="EN_AUDITORIA">EN_AUDITORIA</option>
              <option value="OBSERVADO">OBSERVADO</option>
              <option value="APROBADO">APROBADO</option>
              <option value="DENEGADO">DENEGADO</option>
              <option value="REVISION_HUMANA">REVISION_HUMANA</option>
            </select>
          </label>
        </div>
        {!error && filteredCases.length === 0 && !isLoading ? (
          <EmptyState detail="No assigned cases found right now." />
        ) : null}
        {!error && filteredCases.length > 0 ? (
          <div className="cases-table">
            {filteredCases.map((auditCase) => (
              <CaseRow
                key={auditCase.id || auditCase.claimNumber}
                auditCase={auditCase}
                active={getCaseKey(auditCase) === getCaseKey(selectedCase)}
                onSelectCase={setSelectedCase}
              />
            ))}
          </div>
        ) : null}
      </section>
      {selectedCase ? <CaseDetail selectedCase={selectedCase} compact /> : null}
      {selectedCase ? (
        <div className="page-actions">
          <Link className="primary-action" to={`/dashboard/cases/${getCaseKey(selectedCase)}/upload`}>
            Upload documents
          </Link>
          <Link className="secondary-action" to={`/dashboard/cases/${getCaseKey(selectedCase)}`}>
            View full case
          </Link>
          <ManualAuditButton caseId={getCaseKey(selectedCase)} />
        </div>
      ) : null}
    </>
  );
}

export function UploadsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getAllDocuments()
      .then((data) => {
        if (isMounted) {
          setDocuments(data);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message || "Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader eyebrow="Documents" title="Document control for agent pipeline" />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error ? <UploadedFilesTable uploads={documents} /> : null}
      <div className="page-actions">
        <Link className="primary-action" to="/dashboard/cases">
          Go to cases
        </Link>
      </div>
    </>
  );
}

export function CaseDetailPage() {
  const { caseId } = useParams();
  const [auditCase, setAuditCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchCaseById(caseId)
      .then((data) => {
        if (isMounted) {
          setAuditCase(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!auditCase) {
    return <EmptyState detail="No registered information found for this case." />;
  }

  return (
    <>
      <PageHeader eyebrow="Case detail" title={auditCase.claimNumber || unavailable} />
      <CaseDetail selectedCase={auditCase} />
      <div className="page-actions">
        <Link className="primary-action" to={`/dashboard/cases/${getCaseKey(auditCase)}/upload`}>
          Upload documents
        </Link>
        <Link className="secondary-action" to="/dashboard/cases">
          Back to cases
        </Link>
        <ManualAuditButton caseId={getCaseKey(auditCase)} />
      </div>
    </>
  );
}

export function UploadFilesPage() {
  const { caseId } = useParams();
  const [auditCase, setAuditCase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchCaseById(caseId)
      .then((data) => {
        if (isMounted) {
          setAuditCase(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!auditCase) {
    return <EmptyState detail="No registered information found for this case." />;
  }

  return (
    <>
      <PageHeader eyebrow="Document intake" title={`Documents for ${auditCase.claimNumber || unavailable}`} />
      <CaseDetail selectedCase={auditCase} compact />
      <FileUploadSection defaultAuditNumber={getCaseKey(auditCase)} auditCase={auditCase} />
    </>
  );
}

export function AuditResultPage() {
  const { caseId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result ?? null);
  const [isLoading, setIsLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false);
  const [verdictError, setVerdictError] = useState("");

  useEffect(() => {
    if (result) {
      return;
    }

    let isMounted = true;

    getLatestAudit(caseId)
      .then((data) => {
        if (isMounted) {
          setResult(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseId, result]);

  async function handleGenerateFinalVerdict() {
    setIsGeneratingVerdict(true);
    setVerdictError("");

    try {
      const verdictResult = await generateFinalVerdict(caseId);
      setResult((currentResult) => ({ ...(currentResult ?? {}), ...(verdictResult ?? {}) }));
    } catch (requestError) {
      setVerdictError(requestError.message || "Could not run the audit. Check backend logs.");
    } finally {
      setIsGeneratingVerdict(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Audit result" title={`Audit outcome ${caseId}`} />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {verdictError ? <ErrorState message={verdictError} /> : null}
      {!isLoading && !error && result ? (
        <>
          <div className="page-actions">
            <button className="primary-action" type="button" onClick={handleGenerateFinalVerdict} disabled={isGeneratingVerdict}>
              {isGeneratingVerdict ? "Generating final verdict" : "Generate final verdict"}
            </button>
          </div>
          <AuditResultCard result={result} />
        </>
      ) : null}
      {!isLoading && !error && !result ? (
        <EmptyState detail="This case has no registered audit yet." />
      ) : null}
    </>
  );
}

function ManualAuditButton({ caseId }) {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  async function handleRunAudit() {
    if (!caseId) {
      setError("Data unavailable");
      return;
    }

    setIsRunning(true);
    setError("");

    try {
      const result = await runAudit(caseId, {
        caseId,
        source: "frontend-manual"
      });
      navigate(`/dashboard/cases/${caseId}/result`, { state: { result } });
    } catch (requestError) {
      setError(requestError.message || "Could not run the audit. Check backend logs.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <>
      <button className="primary-action" type="button" onClick={handleRunAudit} disabled={isRunning}>
        {isRunning ? "Running agent audit" : "Run agent audit"}
      </button>
      {error ? <div className="form-message error">{error}</div> : null}
    </>
  );
}

export function AuditHistoryPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const caseId = params.caseId ?? searchParams.get("caseId");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const historyRequest = caseId ? getAuditHistory(caseId) : getAllAuditHistory();

    setIsLoading(true);
    setError("");

    historyRequest
      .then((data) => {
        if (isMounted) {
          setHistory(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [caseId]);

  return (
    <>
      <PageHeader eyebrow="History" title="Recent agent audit runs" />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!isLoading && !error ? <AuditHistoryPreview history={history} /> : null}
    </>
  );
}

export function RulesPage() {
  return (
    <>
      <PageHeader eyebrow="Rules" title="Business rules control center" />
      <BusinessRulesDashboard />
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
        <input placeholder="Search by claim, workshop, or plate" />
      </label>
    </header>
  );
}

function Metrics({ statistics }) {
  return (
    <section className="metrics" aria-label="Audit summary">
      <StatCard label="Audited cases" value={statistics?.totalCases} />
      <StatCard label="Approved" value={statistics?.approvedCases} />
      <StatCard label="With discrepancies" value={statistics?.observedCases} />
      <StatCard label="Denied" value={statistics?.deniedCases} />
      <StatCard label="Human review" value={statistics?.humanReviewCases} />
      <StatCard label="Approval rate" value={isAvailable(statistics?.approvalRate) ? `${statistics.approvalRate}%` : null} />
    </section>
  );
}

function CaseDetail({ selectedCase, compact }) {
  return (
    <article className={`case-detail ${compact ? "compact" : ""}`} aria-label="Selected case detail">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${selectedCase.status}`}>{statusCopy[selectedCase.status] ?? unavailable}</span>
          <h2>{selectedCase.claimNumber || unavailable}</h2>
          <p>{selectedCase.vehicle || unavailable}</p>
        </div>
        <div className="confidence">
          <strong>{isAvailable(selectedCase.confidence) ? `${selectedCase.confidence}%` : unavailable}</strong>
          <span>confidence</span>
        </div>
      </div>

      <div className="summary-band">
        <div>
          <span>Workshop</span>
          <strong>{selectedCase.workshop || unavailable}</strong>
        </div>
        <div>
          <span>Plate</span>
          <strong>{selectedCase.plate || unavailable}</strong>
        </div>
        <div>
          <span>Invoice total</span>
          <strong>{isAvailable(selectedCase.invoiceTotal) ? currency.format(selectedCase.invoiceTotal) : unavailable}</strong>
        </div>
        <div>
          <span>Expected total</span>
          <strong>{isAvailable(selectedCase.tariffTotal) ? currency.format(selectedCase.tariffTotal) : unavailable}</strong>
        </div>
      </div>

      <p className="damage">{selectedCase.reportedDamage || unavailable}</p>

      <div className="findings">
        <h3>Agent findings</h3>
        {selectedCase.findings.length === 0 ? (
          <EmptyState detail="No findings registered for this case." />
        ) : (
          selectedCase.findings.map((finding) => (
            <div className="finding" key={finding.id ?? finding.title}>
              <div>
                <strong>{finding.title || unavailable}</strong>
                <p>{finding.detail || finding.message || unavailable}</p>
              </div>
              <span>{isAvailable(finding.impact) ? currency.format(finding.impact) : unavailable}</span>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function CaseRow({ auditCase, active, onSelectCase }) {
  const Icon = statusIcon[auditCase.status] ?? FileSearch;

  return (
    <button type="button" className={`case-row ${active ? "active" : ""}`} onClick={() => onSelectCase?.(auditCase)}>
      <div className={`case-icon ${auditCase.status}`}>
        <Icon size={18} />
      </div>
      <div className="case-copy">
        <strong>{auditCase.claimNumber || unavailable}</strong>
        <span>{auditCase.plate ? `${auditCase.plate} - ` : ""}{auditCase.vehicle || unavailable}</span>
      </div>
      <div className="case-amount">
        <strong>{isAvailable(auditCase.invoiceTotal) ? currency.format(auditCase.invoiceTotal) : unavailable}</strong>
        <span>{auditCase.rawStatus || unavailable}</span>
      </div>
    </button>
  );
}

function AuditResultCard({ result }) {
  const findings = result.findings ?? [];
  const discrepancies = result.discrepancies ?? [];
  const topReasons = result.topReasons ?? [];
  const documents = result.documents ?? [];

  return (
    <section className="route-panel">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${auditStatusClass(result.status)}`}>{result.status || unavailable}</span>
          <h2>{result.auditId || unavailable}</h2>
          <p>{result.summary || unavailable}</p>
        </div>
        <div className="confidence">
          <strong>{isAvailable(result.confidence) ? `${Math.round(result.confidence * 100)}%` : unavailable}</strong>
          <span>confidence</span>
        </div>
      </div>

      <div className="result-metrics">
        <StatCard label="Risk" value={isAvailable(result.riskScore) ? result.riskScore : null} />
        <StatCard label="Invoice" value={isAvailable(result.invoiceTotal) ? currency.format(result.invoiceTotal) : null} />
        <StatCard label="Expected" value={isAvailable(result.expectedTotal) ? currency.format(result.expectedTotal) : null} />
        <StatCard label="Difference" value={isAvailable(result.difference) ? currency.format(result.difference) : null} />
      </div>

      <ResultSection title="Final verdict">
        <div className="form-message info">{result.finalVerdict || unavailable}</div>
      </ResultSection>

      <ResultSection title="Findings">
        {findings.length === 0 ? (
          <EmptyState detail="No findings registered." />
        ) : (
          findings.map((item, index) => (
            <div className="finding" key={`${item.type ?? item.title ?? "finding"}-${index}`}>
              <div>
                <strong>{item.title || item.type || unavailable}</strong>
                <p>{item.message || item.detail || unavailable}</p>
              </div>
              <span>{item.severity || item.impact || unavailable}</span>
            </div>
          ))
        )}
      </ResultSection>

      <div className="findings">
        <h3>Discrepancies</h3>
        {discrepancies.length === 0 ? (
          <EmptyState detail="No discrepancies registered." />
        ) : (
          discrepancies.map((item, index) => (
            <div className="finding" key={`${item.type}-${index}`}>
              <div>
                <strong>{item.type || unavailable}</strong>
                <p>{item.message || unavailable}</p>
                <p>
                  Expected: {valueOrUnavailable(item.expected)} | Found: {valueOrUnavailable(item.found)}
                  {item.documentType ? ` | Document: ${item.documentType}` : ""}
                </p>
              </div>
              <span>{item.difference ?? item.severity ?? unavailable}</span>
            </div>
          ))
        )}
      </div>

      <ResultSection title="Top reasons">
        {topReasons.length === 0 ? (
          <EmptyState detail="No top reasons registered." />
        ) : (
          topReasons.map((item, index) => (
            <div className="finding" key={`${item.reason ?? item.type ?? "reason"}-${index}`}>
              <div>
                <strong>{item.reason || item.type || unavailable}</strong>
                <p>{item.message || item.detail || unavailable}</p>
              </div>
              <span>{item.percentage ? `${item.percentage}%` : item.count ?? unavailable}</span>
            </div>
          ))
        )}
      </ResultSection>

      <ResultSection title="Analyzed documents">
        {documents.length === 0 ? (
          <EmptyState detail="No documents linked to this result." />
        ) : (
          documents.map((document, index) => (
            <div className="finding" key={`${document.name ?? document.originalName ?? "document"}-${index}`}>
              <div>
                <strong>{document.documentType || document.type || unavailable}</strong>
                <p>{document.originalName || document.name || unavailable}</p>
              </div>
              <span>{document.parseStatus || document.status || unavailable}</span>
            </div>
          ))
        )}
      </ResultSection>

      <div className="form-message info">{result.recommendation || unavailable}</div>
    </section>
  );
}

function ResultSection({ title, children }) {
  return (
    <div className="findings">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function auditStatusClass(status) {
  if (status === "APROBADO") {
    return "bajo";
  }

  if (status === "REVISION_HUMANA") {
    return "medio";
  }

  return "alto";
}

function valueOrUnavailable(value) {
  return isAvailable(value) ? value : unavailable;
}

function AuditHistoryPreview({ history }) {
  return (
    <section className="route-panel">
      <div className="section-heading">
        <h2>Latest audits</h2>
      </div>
      {history.length === 0 ? (
        <EmptyState detail="No previous audits found." />
      ) : (
        <div className="cases-table">
          {history.slice(0, 5).map((item) => (
            <Link className="case-row" to={`/dashboard/cases/${item.caseId}/result`} key={item.auditId ?? item.id}>
              <div className="case-copy">
                <strong>{item.auditId ?? item.id ?? unavailable}</strong>
                <span>{item.caseId ?? unavailable}</span>
              </div>
              <div className="case-amount">
                <strong>{item.status ?? unavailable}</strong>
                <span>{item.createdAt ? new Date(item.createdAt).toLocaleString("es-EC") : unavailable}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function isAvailable(value) {
  return value !== null && value !== undefined && value !== "";
}

function getCaseKey(auditCase) {
  return auditCase?.id || auditCase?.claimNumber || "";
}
