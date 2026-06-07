import { FileUp, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { runAudit } from "../services/auditService";
import {
  allowedUploadExtensions,
  documentTypeOptions,
  formatFileSize,
  getDocuments,
  maxUploadSizeBytes,
  normalizeDocumentsResponse,
  requiredDocumentTypes,
  uploadDocuments,
  validateAuditFile,
  validateAuditFilesTotal
} from "../services/uploadService";
import { ErrorState, LoadingState } from "./States";
import { UploadedFilesTable } from "./UploadedFilesTable";

const documentOptions = documentTypeOptions;

export function FileUploadSection({ defaultAuditNumber, auditCase }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [auditNumber, setAuditNumber] = useState(defaultAuditNumber ?? "");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: "info", text: "Select documents to attach to this audit run." });
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    setAuditNumber(defaultAuditNumber ?? "");
  }, [defaultAuditNumber]);

  useEffect(() => {
    const normalizedAuditNumber = auditNumber.trim();

    if (!normalizedAuditNumber) {
      setUploads([]);
      return;
    }

    let isMounted = true;
    setIsLoadingDocuments(true);
    setDocumentsError("");

    getDocuments(normalizedAuditNumber)
      .then((documents) => {
        if (isMounted) {
          setUploads(documents);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDocumentsError("Could not load data. Check backend connectivity.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [auditNumber]);

  const selectedTotalBytes = useMemo(
    () => selectedFiles.reduce((total, item) => total + item.file.size, 0),
    [selectedFiles]
  );
  const currentAuditUploadsTotalBytes = useMemo(
    () => uploads.reduce((total, upload) => total + Number(upload.size ?? 0), 0),
    [uploads]
  );
  const documentTypes = useMemo(
    () => new Set([
      ...uploads.map((upload) => upload.documentType),
      ...selectedFiles.map((item) => item.documentType)
    ]),
    [selectedFiles, uploads]
  );
  const missingRequiredTypes = useMemo(
    () => requiredDocumentTypes.filter((documentType) => !documentTypes.has(documentType)),
    [documentTypes]
  );
  const isAuditReady = missingRequiredTypes.length === 0 && (uploads.length > 0 || selectedFiles.length > 0);

  const selectedFilesError = useMemo(() => {
    const typeError = selectedFiles.map((item) => validateAuditFile(item.file)).find(Boolean);

    if (typeError) {
      return typeError;
    }

    return validateAuditFilesTotal(
      selectedFiles.map((item) => item.file),
      currentAuditUploadsTotalBytes
    );
  }, [currentAuditUploadsTotalBytes, selectedFiles]);

  function handleSelectFiles(event) {
    const incomingFiles = Array.from(event.target.files ?? []);

    if (incomingFiles.length === 0) {
      return;
    }

    const typeError = incomingFiles.map(validateAuditFile).find(Boolean);

    if (typeError) {
      setMessage({ type: "error", text: typeError });
      event.target.value = "";
      return;
    }

    const totalError = validateAuditFilesTotal(
      incomingFiles,
      selectedTotalBytes + currentAuditUploadsTotalBytes
    );

    if (totalError) {
      setMessage({ type: "error", text: totalError });
      event.target.value = "";
      return;
    }

    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...incomingFiles.map((file) => ({
        file,
        documentType: suggestDocumentType(file.name)
      }))
    ]);
    setMessage({ type: "success", text: `${incomingFiles.length} file(s) added to queue.` });
    event.target.value = "";
  }

  function handleRemoveSelectedFile(index) {
    setSelectedFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  function handleChangeDocumentType(index, documentType) {
    setSelectedFiles((currentFiles) =>
      currentFiles.map((item, fileIndex) => (fileIndex === index ? { ...item, documentType } : item))
    );
  }

  function handleChangeUploadedDocumentType(uploadId, documentType) {
    setUploads((currentUploads) =>
      currentUploads.map((upload) => (upload.id === uploadId ? { ...upload, documentType } : upload))
    );
    setMessage({ type: "success", text: "Document type updated for this audit run." });
  }

  function validateRequiredDocuments() {
    if (missingRequiredTypes.length > 0) {
      return `Missing required documents: ${missingRequiredTypes.join(", ")}.`;
    }

    return "";
  }

  function buildAuditPayload(documents) {
    return {
      caseId: auditNumber.trim(),
      vehicle: {
        plate: auditCase?.plate ?? "",
        model: auditCase?.vehicle ?? ""
      },
      reportedDamages: auditCase?.reportedDamages ?? [auditCase?.reportedDamage].filter(Boolean),
      documents: documents.map((document) => ({
        name: document.name,
        type: document.documentType,
        size: document.size,
        mimeType: document.mimeType
      })),
      requestedBy: "Workshop",
      source: "frontend-dashboard"
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!auditNumber.trim()) {
      setMessage({ type: "error", text: "Select or enter a claim number." });
      return;
    }

    if (selectedFiles.length === 0 && uploads.length === 0) {
      setMessage({ type: "error", text: "Select at least one file to audit." });
      return;
    }

    if (selectedFilesError) {
      setMessage({ type: "error", text: selectedFilesError });
      return;
    }

    const requiredDocumentsError = validateRequiredDocuments();

    if (requiredDocumentsError) {
      setMessage({ type: "error", text: requiredDocumentsError });
      return;
    }

    setIsAuditing(true);
    setMessage({ type: "info", text: "Running agent audit" });

    try {
      const uploadResponse = selectedFiles.length ? await uploadDocuments(auditNumber.trim(), selectedFiles) : null;
      const uploadedDocuments = normalizeDocumentsResponse(uploadResponse);
      const selectedDocuments = uploadedDocuments.length ? uploadedDocuments : selectedFiles.map((item) => createSelectedDocument(item, auditNumber.trim()));
      const documents = mergeDocuments(uploads, selectedDocuments);
      const payload = buildAuditPayload(documents);
      const result = await runAudit(auditNumber.trim(), payload);

      if (selectedDocuments.length) {
        setUploads(documents);
      }
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage({ type: "success", text: "Audit completed successfully." });
      navigate(`/dashboard/cases/${auditNumber.trim()}/result`, { state: { result } });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not load data. Check backend connectivity." });
    } finally {
      setIsAuditing(false);
    }
  }

  return (
    <section className="upload-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Documents</p>
          <h2>Audit documents</h2>
        </div>
        <div className="agent-icon">
          <FileUp size={20} />
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Claim or audit id
          <input value={auditNumber} onChange={(event) => setAuditNumber(event.target.value)} placeholder="SIN-2026-0148" />
        </label>

        <label className="file-picker">
          <UploadCloud size={20} />
          <span>{selectedFiles.length ? `${selectedFiles.length} file(s) selected` : "Select files"}</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg,.txt"
            onChange={handleSelectFiles}
          />
        </label>

        <button className="primary-action" type="submit" disabled={isAuditing}>
          <UploadCloud size={17} />
          {isAuditing ? "Running agent audit" : "Upload and audit"}
        </button>
      </form>

      <div className="upload-helper">
        <span>Formats: {allowedUploadExtensions.map((item) => item.toUpperCase()).join(", ")}</span>
        <span>Max total: {formatFileSize(maxUploadSizeBytes)}</span>
        <span>Already uploaded: {formatFileSize(currentAuditUploadsTotalBytes)}</span>
        <span>Selected: {formatFileSize(selectedTotalBytes)}</span>
      </div>

      <DocumentReadinessChecklist documentTypes={documentTypes} isAuditReady={isAuditReady} />

      {isLoadingDocuments ? <LoadingState message="Loading case documents..." /> : null}
      {documentsError ? <ErrorState message={documentsError} /> : null}
      {selectedFilesError ? <div className="form-message error">{selectedFilesError}</div> : null}
      <div className={`form-message ${message.type}`}>{message.text}</div>

      {selectedFiles.length ? (
        <div className="selected-files">
          <h3>Selected files</h3>
          {selectedFiles.map((item, index) => (
            <div className="selected-file-row" key={`${item.file.name}-${item.file.lastModified}-${index}`}>
              <div>
                <strong>{item.file.name}</strong>
                <span>
                  {formatFileSize(item.file.size)} - {(item.file.name.split(".").pop() ?? "file").toUpperCase()} - pending
                </span>
              </div>
              <select value={item.documentType} onChange={(event) => handleChangeDocumentType(index, event.target.value)}>
                {documentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="icon-button danger" type="button" onClick={() => handleRemoveSelectedFile(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <UploadedFilesTable
        uploads={uploads}
        documentOptions={documentOptions}
        onChangeDocumentType={handleChangeUploadedDocumentType}
      />
    </section>
  );
}

function DocumentReadinessChecklist({ documentTypes, isAuditReady }) {
  return (
    <div className={`audit-checklist ${isAuditReady ? "ready" : ""}`} aria-label="Required documents for audit">
      {requiredDocumentTypes.map((documentType) => {
        const isComplete = documentTypes.has(documentType);

        return (
          <span className={isComplete ? "complete" : "missing"} key={documentType}>
            {documentLabel(documentType)}: {isComplete ? "complete" : "pending"}
          </span>
        );
      })}
      <strong>{isAuditReady ? "Ready to audit" : "Complete or reclassify documents to run audit"}</strong>
    </div>
  );
}

function mergeDocuments(currentDocuments, nextDocuments) {
  const documentsByKey = new Map();

  [...currentDocuments, ...nextDocuments].forEach((document) => {
    documentsByKey.set(document.id ?? `${document.name}-${document.documentType}`, document);
  });

  return Array.from(documentsByKey.values());
}

function createSelectedDocument(item, auditNumber) {
  return {
    id: `${item.file.name}-${item.documentType}-${item.file.lastModified}`,
    auditNumber,
    documentType: item.documentType,
    name: item.file.name,
    size: item.file.size,
    type: item.file.name.split(".").pop()?.toUpperCase() ?? item.file.type,
    mimeType: item.file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    status: "cargado",
    extractionStatus: "pending",
    parseStatus: "pending",
    parseError: ""
  };
}

function suggestDocumentType(fileName) {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.includes("factura")) {
    return "FACTURA";
  }

  if (normalizedName.includes("orden") || normalizedName.includes("reparacion")) {
    return "ORDEN_REPARACION";
  }

  if (normalizedName.includes("mano") || normalizedName.includes("obra")) {
    return "DETALLE_MANO_OBRA";
  }

  if (
    normalizedName.includes("foto") ||
    normalizedName.includes("fotos") ||
    normalizedName.includes("danio") ||
    normalizedName.includes("daño") ||
    normalizedName.includes("dano") ||
    normalizedName.endsWith(".png") ||
    normalizedName.endsWith(".jpg") ||
    normalizedName.endsWith(".jpeg")
  ) {
    return "FOTOS_DANIO";
  }

  if (normalizedName.includes("tarifario")) {
    return "TARIFARIO";
  }

  if (normalizedName.includes("poliza") || normalizedName.includes("póliza")) {
    return "POLIZA";
  }

  if (normalizedName.includes("sustento") || normalizedName.includes("adicional")) {
    return "SUSTENTO_ADICIONAL";
  }

  return "FACTURA";
}

function documentLabel(documentType) {
  const labels = {
    FACTURA: "Invoice",
    ORDEN_REPARACION: "Repair order",
    DETALLE_MANO_OBRA: "Labor detail",
    FOTOS_DANIO: "Damage photos",
    TARIFARIO: "Tariff sheet",
    POLIZA: "Policy",
    SUSTENTO_ADICIONAL: "Supporting document"
  };

  return labels[documentType] ?? documentType;
}
